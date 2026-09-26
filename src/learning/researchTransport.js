// No network implementation exists in Learning V1.
export class DisabledResearchTransport {
  enabled = false;
  startSession() {} recordEvent() {} submitPreTest() {} submitPostTest() {} finishSession() {}
}
export class InMemoryResearchTransport {
  enabled = true;
  records = [];
  startSession(data) { this.records.push({type:'startSession', data:structuredClone(data)}); }
  recordEvent(data) { this.records.push({type:'recordEvent', data:structuredClone(data)}); }
  submitPreTest(data) { this.records.push({type:'submitPreTest', data:structuredClone(data)}); }
  submitPostTest(data) { this.records.push({type:'submitPostTest', data:structuredClone(data)}); }
  finishSession(data) { this.records.push({type:'finishSession', data:structuredClone(data)}); }
}
export const defaultResearchTransport = () => new DisabledResearchTransport();
