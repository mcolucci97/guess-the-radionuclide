// Generate auditable RTDB rules. No object/sentinel comparisons: every immutable leaf is checked.
import fs from 'node:fs/promises';
import {be} from '../src/engine/advanced.js';
const and = (...parts) => parts.filter(Boolean).map(s => `(${s})`).join(' && ');
const or = (...parts) => parts.map(s => `(${s})`).join(' || ');
const old = p => `data.child('${p}').val()`, next = p => `newData.child('${p}').val()`;
const equal = (...paths) => and(...paths.map(p => `${next(p)} === ${old(p)}`));
const is = (p, v) => `${next(p)} === ${JSON.stringify(v)}`;
const phase = p => `${old('phase')} === '${p}'`;
const member = or(`${old('hostUid')} === auth.uid`, `${old('guestUid')} === auth.uid`);
const current = `(${old('current')} === 1 ? ${old('hostUid')} : ${old('guestUid')}) === auth.uid`;
const privateSecret = `root.child('private').child($code).child(auth.uid).child('secretId').val()`;
const eventKeys = ['id','kind','rawText','language','queryJson','answer','acceptedQueryJson','cardId','correct'];
const sameEvent = equal(...eventKeys.map(k => 'event/' + k));
const sameReady = equal('ready/p1','ready/p2');
const sameTurn = equal('turn','current');
const immutable = ['schemaVersion','gameVersion','hostUid','createdAt', 'config/audience','config/level','config/assist','config/deckSize',
 ...Array.from({length:59},(_,i) => 'config/deckIds/' + i), ...be.map(c => 'config/deckMap/' + c.id)];
const eventBase = and(`${next('event/id')} === ${next('lastActionId')}`, is('event/answer','pending'), is('event/acceptedQueryJson',''), is('event/correct',false));
const join = and(phase('select'), `${old('guestUid')} === ''`, `${old('hostUid')} !== auth.uid`, `${next('guestUid')} === auth.uid`, is('phase','select'), sameTurn, sameReady, sameEvent, is('winner',0));
const ready = and(phase('select'), `${old('guestUid')} !== ''`, `${privateSecret} !== ''`, `${privateSecret} !== null`, sameTurn, sameEvent, is('winner',0),
 or(and(`${old('hostUid')} === auth.uid`, `${old('ready/p1')} === false`, is('ready/p1',true), equal('ready/p2')),
    and(`${old('guestUid')} === auth.uid`, `${old('ready/p2')} === false`, is('ready/p2',true), equal('ready/p1'))),
 `${next('phase')} === (${next('ready/p1')} === true && ${next('ready/p2')} === true ? 'ask' : 'select')`);
const question = and(phase('ask'), current, is('phase','answer'), sameTurn, sameReady, is('winner',0), eventBase, is('event/cardId',''),
 or(and(is('event/kind','written'), `${next('event/rawText')}.length > 0`), and(is('event/kind','verbal'), is('event/rawText',''), is('event/queryJson',''))));
const answer = and(phase('answer'), `!(${current})`, is('phase','review'), sameTurn, sameReady, is('winner',0),
 equal(...eventKeys.filter(k=>!['answer','acceptedQueryJson'].includes(k)).map(k=>'event/'+k)),
 or(is('event/answer','yes'), is('event/answer','no')), `${old('event/kind')} !== 'verbal' || ${next('event/acceptedQueryJson')} === ''`);
const end = and(phase('review'), current, is('phase','ask'), sameReady, sameEvent, is('winner',0), `${next('turn')} === ${old('turn')} + 1`, `${next('current')} === 3 - ${old('current')}`);
const guess = and(phase('ask'), current, is('phase','guess'), sameTurn, sameReady, is('winner',0), eventBase,
 is('event/kind','guess'), is('event/rawText',''), is('event/queryJson',''), `data.child('config/deckMap').child(${next('event/cardId')}).val() === true`);
const resolve = and(phase('guess'), `!(${current})`, sameReady, equal(...eventKeys.filter(k=>k!=='correct').map(k=>'event/'+k)),
 `${next('event/correct')} === (${old('event/cardId')} === ${privateSecret})`,
 or(and(is('event/correct',true), is('phase','finished'), `${next('winner')} === ${old('current')}`, sameTurn),
    and(is('event/correct',false), is('phase','ask'), is('winner',0), `${next('turn')} === ${old('turn')} + 1`, `${next('current')} === 3 - ${old('current')}`)));
const creation = and('!data.exists()', `${next('hostUid')} === auth.uid`, is('guestUid',''), is('phase','select'), is('seq',0), is('turn',1), is('current',1), is('winner',0), is('ready/p1',false), is('ready/p2',false), is('event/kind','none'), is('event/id',''), is('lastActionId',''));
const update = and('data.exists()', equal(...immutable), `${next('seq')} === ${old('seq')} + 1`, `${next('lastActionId')} !== ${old('lastActionId')}`, `${next('lastActionId')}.length > 0`,
 or(join, and(member, equal('guestUid'), or(ready,question,answer,end,guess,resolve))));
const str = max => ({'.validate': `newData.isString() && newData.val().length <= ${max}`});
const enumeration = values => ({'.validate': or(...values.map(v=>`newData.val() === ${JSON.stringify(v)}`))});
const required = keys => `newData.hasChildren(${JSON.stringify(keys)})`;
const event = {'.validate': required(eventKeys), ...Object.fromEntries(eventKeys.map(k=>[k,str(4096)])),
 id:str(100), kind:enumeration(['none','written','verbal','guess']), rawText:str(4000), language:enumeration(['it','en','fr']),
 answer:enumeration(['pending','yes','no']), cardId:str(20), correct:{'.validate':'newData.isBoolean()'}, '$other':{'.validate':false}};
const deckIds = {'.validate': and(...Array.from({length:59},(_,i)=>`newData.parent().child('deckSize').val() > ${i} ? (newData.child('${i}').isString() && newData.parent().child('deckMap').child(newData.child('${i}').val()).val() === true) : !newData.child('${i}').exists()`)),
 ...Object.fromEntries(Array.from({length:59},(_,i)=>[i,str(20)])), '$other':{'.validate':false}};
const deckMap = {...Object.fromEntries(be.map(c=>[c.id,{'.validate':'newData.val() === true'}])), '$other':{'.validate':false}};
const config = {'.validate':required(['deckIds','deckMap','deckSize','audience','level','assist']), deckIds,deckMap,
 deckSize:{'.validate':'newData.isNumber() && newData.val() >= 2 && newData.val() <= 59 && newData.val() % 1 === 0'},
 audience:enumeration(['child','adult']),level:enumeration(['base','intermediate','expert']),assist:enumeration(['manual','assisted']), '$other':{'.validate':false}};
const room = {
 '.read': `auth !== null && (!data.exists() || data.child('guestUid').val() === '' || (${member}))`,
 '.write': and('auth !== null', "$code.matches(/^[A-HJ-NP-Z2-9]{6}$/)", 'newData.exists()', or(creation, update)),
 '.validate':required(['schemaVersion','gameVersion','hostUid','guestUid','config','ready','phase','seq','turn','current','winner','event','lastActionId','createdAt']),
 schemaVersion:enumeration([1]),gameVersion:enumeration(['3']),hostUid:str(128),guestUid:str(128),config,
 ready:{'.validate':required(['p1','p2']),p1:{'.validate':'newData.isBoolean()'},p2:{'.validate':'newData.isBoolean()'},'$other':{'.validate':false}},
 phase:enumeration(['select','ask','answer','review','guess','finished']), seq:{'.validate':'newData.isNumber() && newData.val() >= 0 && newData.val() % 1 === 0'},
 turn:{'.validate':'newData.isNumber() && newData.val() >= 1 && newData.val() % 1 === 0'},current:enumeration([1,2]),winner:enumeration([0,1,2]),
 event,lastActionId:str(100),createdAt:{'.validate':'newData.isNumber() && newData.val() > 0 && newData.val() <= now + 60000'},'$other':{'.validate':false},
};
const roomPath = "root.child('rooms').child($code)";
const assigned = `auth !== null && (${roomPath}.child('hostUid').val() === auth.uid || ${roomPath}.child('guestUid').val() === auth.uid)`;
const owned = and(assigned,'auth.uid === $uid');
const privateBoard = {
 '.read':owned,
 '.write':and(owned,'newData.exists()', `!data.exists() || data.child('secretId').val() === '' || newData.child('secretId').val() === data.child('secretId').val()`),
 '.validate':required(['secretId','remaining','manuallyDown','answerAssistance','appliedEvent']),
 secretId:{'.validate':and('newData.isString()', or("newData.val() === ''", and(`${roomPath}.child('config/deckMap').child(newData.val()).val() === true`, `data.val() === newData.val() || ${roomPath}.child('phase').val() === 'select'`)))},
 answerAssistance:{'.validate':'newData.isBoolean()'},appliedEvent:str(100),
 remaining: {'.validate':'newData.hasChildren()', '$id':{'.validate':`newData.isBoolean() && ${roomPath}.child('config/deckMap').child($id).val() === true`}},
 manuallyDown: {'.validate':'newData.hasChildren()', '$id':{'.validate':`newData.isBoolean() && ${roomPath}.child('config/deckMap').child($id).val() === true`}},
 '$other':{'.validate':false},
};
const rules = {rules:{'.read':false,'.write':false,rooms:{$code:room},private:{$code:{$uid:privateBoard}},presence:{$code:{'.read':assigned,$uid:{$connection:{'.write':owned,'.validate':required(['connectedAt']),connectedAt:{'.validate':'newData.isNumber()'},'$other':{'.validate':false}}}}}}};
await fs.writeFile('database.rules.json',JSON.stringify(rules,null,2)+'\n');
