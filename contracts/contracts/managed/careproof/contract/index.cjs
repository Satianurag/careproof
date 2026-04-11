'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.9.0';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

class _ZswapCoinPublicKey_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_2 = new _ZswapCoinPublicKey_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_5 = new __compactRuntime.CompactTypeBytes(128);

class _Credential_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment())))))));
  }
  fromValue(value_0) {
    return {
      id: _descriptor_3.fromValue(value_0),
      credential_type: _descriptor_4.fromValue(value_0),
      issuer: _descriptor_2.fromValue(value_0),
      issued_at: _descriptor_3.fromValue(value_0),
      expiry: _descriptor_3.fromValue(value_0),
      patient_name: _descriptor_5.fromValue(value_0),
      condition: _descriptor_5.fromValue(value_0),
      treatment: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.id).concat(_descriptor_4.toValue(value_0.credential_type).concat(_descriptor_2.toValue(value_0.issuer).concat(_descriptor_3.toValue(value_0.issued_at).concat(_descriptor_3.toValue(value_0.expiry).concat(_descriptor_5.toValue(value_0.patient_name).concat(_descriptor_5.toValue(value_0.condition).concat(_descriptor_5.toValue(value_0.treatment))))))));
  }
}

const _descriptor_6 = new _Credential_0();

class _tuple_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]).concat(_descriptor_0.toValue(value_0[2])));
  }
}

const _descriptor_7 = new _tuple_0();

class _VerificationRecord_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      verifier: _descriptor_2.fromValue(value_0),
      credential_hash: _descriptor_1.fromValue(value_0),
      timestamp: _descriptor_3.fromValue(value_0),
      result: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.verifier).concat(_descriptor_1.toValue(value_0.credential_hash).concat(_descriptor_3.toValue(value_0.timestamp).concat(_descriptor_0.toValue(value_0.result))));
  }
}

const _descriptor_8 = new _VerificationRecord_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _VerificationKey_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      verifier: _descriptor_2.fromValue(value_0),
      credential_hash: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.verifier).concat(_descriptor_1.toValue(value_0.credential_hash));
  }
}

const _descriptor_10 = new _VerificationKey_0();

class _CredentialKey_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_3.alignment());
  }
  fromValue(value_0) {
    return {
      client: _descriptor_2.fromValue(value_0),
      id: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.client).concat(_descriptor_3.toValue(value_0.id));
  }
}

const _descriptor_11 = new _CredentialKey_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_12 = new _ContractAddress_0();

const _descriptor_13 = new __compactRuntime.CompactTypeField();

class _MerkleTreeDigest_0 {
  alignment() {
    return _descriptor_13.alignment();
  }
  fromValue(value_0) {
    return {
      field: _descriptor_13.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.field);
  }
}

const _descriptor_14 = new _MerkleTreeDigest_0();

const _descriptor_15 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      compute_credential_hash(context, ...args_1) {
        return { result: pureCircuits.compute_credential_hash(...args_1), context };
      },
      compute_credential_key(context, ...args_1) {
        return { result: pureCircuits.compute_credential_key(...args_1), context };
      },
      add_doctor: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`add_doctor: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const doctor_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('add_doctor',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 103 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(doctor_0) === 'object' && doctor_0.bytes.buffer instanceof ArrayBuffer && doctor_0.bytes.BYTES_PER_ELEMENT === 1 && doctor_0.bytes.length === 32)) {
          __compactRuntime.type_error('add_doctor',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 103 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      doctor_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(doctor_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._add_doctor_0(context, partialProofData, doctor_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      remove_doctor: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`remove_doctor: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const doctor_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('remove_doctor',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 109 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(doctor_0) === 'object' && doctor_0.bytes.buffer instanceof ArrayBuffer && doctor_0.bytes.BYTES_PER_ELEMENT === 1 && doctor_0.bytes.length === 32)) {
          __compactRuntime.type_error('remove_doctor',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 109 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      doctor_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(doctor_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._remove_doctor_0(context,
                                               partialProofData,
                                               doctor_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      add_verifier: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`add_verifier: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const verifier_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('add_verifier',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 115 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(verifier_0) === 'object' && verifier_0.bytes.buffer instanceof ArrayBuffer && verifier_0.bytes.BYTES_PER_ELEMENT === 1 && verifier_0.bytes.length === 32)) {
          __compactRuntime.type_error('add_verifier',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 115 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      verifier_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(verifier_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._add_verifier_0(context,
                                              partialProofData,
                                              verifier_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      remove_verifier: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`remove_verifier: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const verifier_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('remove_verifier',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 121 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(verifier_0) === 'object' && verifier_0.bytes.buffer instanceof ArrayBuffer && verifier_0.bytes.BYTES_PER_ELEMENT === 1 && verifier_0.bytes.length === 32)) {
          __compactRuntime.type_error('remove_verifier',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 121 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      verifier_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(verifier_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._remove_verifier_0(context,
                                                 partialProofData,
                                                 verifier_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      toggle_pause: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`toggle_pause: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('toggle_pause',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 128 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._toggle_pause_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      issue_credential: (...args_1) => {
        if (args_1.length !== 9) {
          throw new __compactRuntime.CompactError(`issue_credential: expected 9 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_type_0 = args_1[1];
        const id_0 = args_1[2];
        const issued_at_0 = args_1[3];
        const expiry_0 = args_1[4];
        const client_0 = args_1[5];
        const patient_name_0 = args_1[6];
        const condition_0 = args_1[7];
        const treatment_0 = args_1[8];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(credential_type_0) === 'bigint' && credential_type_0 >= 0n && credential_type_0 <= 255n)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Uint<0..255>',
                                      credential_type_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Uint<0..18446744073709551615>',
                                      id_0)
        }
        if (!(typeof(issued_at_0) === 'bigint' && issued_at_0 >= 0n && issued_at_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Uint<0..18446744073709551615>',
                                      issued_at_0)
        }
        if (!(typeof(expiry_0) === 'bigint' && expiry_0 >= 0n && expiry_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 4 (argument 5 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Uint<0..18446744073709551615>',
                                      expiry_0)
        }
        if (!(typeof(client_0) === 'object' && client_0.bytes.buffer instanceof ArrayBuffer && client_0.bytes.BYTES_PER_ELEMENT === 1 && client_0.bytes.length === 32)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 5 (argument 6 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      client_0)
        }
        if (!(patient_name_0.buffer instanceof ArrayBuffer && patient_name_0.BYTES_PER_ELEMENT === 1 && patient_name_0.length === 128)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 6 (argument 7 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Bytes<128>',
                                      patient_name_0)
        }
        if (!(condition_0.buffer instanceof ArrayBuffer && condition_0.BYTES_PER_ELEMENT === 1 && condition_0.length === 128)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 7 (argument 8 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Bytes<128>',
                                      condition_0)
        }
        if (!(treatment_0.buffer instanceof ArrayBuffer && treatment_0.BYTES_PER_ELEMENT === 1 && treatment_0.length === 128)) {
          __compactRuntime.type_error('issue_credential',
                                      'argument 8 (argument 9 as invoked from Typescript)',
                                      'careproof.compact line 137 char 1',
                                      'Bytes<128>',
                                      treatment_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(credential_type_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(issued_at_0).concat(_descriptor_3.toValue(expiry_0).concat(_descriptor_2.toValue(client_0).concat(_descriptor_5.toValue(patient_name_0).concat(_descriptor_5.toValue(condition_0).concat(_descriptor_5.toValue(treatment_0)))))))),
            alignment: _descriptor_4.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_2.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment())))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issue_credential_0(context,
                                                  partialProofData,
                                                  credential_type_0,
                                                  id_0,
                                                  issued_at_0,
                                                  expiry_0,
                                                  client_0,
                                                  patient_name_0,
                                                  condition_0,
                                                  treatment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      disclose_credential: (...args_1) => {
        if (args_1.length !== 10) {
          throw new __compactRuntime.CompactError(`disclose_credential: expected 10 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_type_0 = args_1[1];
        const id_0 = args_1[2];
        const issued_at_0 = args_1[3];
        const expiry_0 = args_1[4];
        const issuer_0 = args_1[5];
        const patient_name_0 = args_1[6];
        const condition_0 = args_1[7];
        const treatment_0 = args_1[8];
        const disclose_fields_0 = args_1[9];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(credential_type_0) === 'bigint' && credential_type_0 >= 0n && credential_type_0 <= 255n)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Uint<0..255>',
                                      credential_type_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Uint<0..18446744073709551615>',
                                      id_0)
        }
        if (!(typeof(issued_at_0) === 'bigint' && issued_at_0 >= 0n && issued_at_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Uint<0..18446744073709551615>',
                                      issued_at_0)
        }
        if (!(typeof(expiry_0) === 'bigint' && expiry_0 >= 0n && expiry_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 4 (argument 5 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Uint<0..18446744073709551615>',
                                      expiry_0)
        }
        if (!(typeof(issuer_0) === 'object' && issuer_0.bytes.buffer instanceof ArrayBuffer && issuer_0.bytes.BYTES_PER_ELEMENT === 1 && issuer_0.bytes.length === 32)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 5 (argument 6 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      issuer_0)
        }
        if (!(patient_name_0.buffer instanceof ArrayBuffer && patient_name_0.BYTES_PER_ELEMENT === 1 && patient_name_0.length === 128)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 6 (argument 7 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Bytes<128>',
                                      patient_name_0)
        }
        if (!(condition_0.buffer instanceof ArrayBuffer && condition_0.BYTES_PER_ELEMENT === 1 && condition_0.length === 128)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 7 (argument 8 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Bytes<128>',
                                      condition_0)
        }
        if (!(treatment_0.buffer instanceof ArrayBuffer && treatment_0.BYTES_PER_ELEMENT === 1 && treatment_0.length === 128)) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 8 (argument 9 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      'Bytes<128>',
                                      treatment_0)
        }
        if (!(Array.isArray(disclose_fields_0) && disclose_fields_0.length === 3  && typeof(disclose_fields_0[0]) === 'boolean' && typeof(disclose_fields_0[1]) === 'boolean' && typeof(disclose_fields_0[2]) === 'boolean')) {
          __compactRuntime.type_error('disclose_credential',
                                      'argument 9 (argument 10 as invoked from Typescript)',
                                      'careproof.compact line 183 char 1',
                                      '[Boolean, Boolean, Boolean]',
                                      disclose_fields_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(credential_type_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(issued_at_0).concat(_descriptor_3.toValue(expiry_0).concat(_descriptor_2.toValue(issuer_0).concat(_descriptor_5.toValue(patient_name_0).concat(_descriptor_5.toValue(condition_0).concat(_descriptor_5.toValue(treatment_0).concat(_descriptor_7.toValue(disclose_fields_0))))))))),
            alignment: _descriptor_4.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_2.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_7.alignment()))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._disclose_credential_0(context,
                                                     partialProofData,
                                                     credential_type_0,
                                                     id_0,
                                                     issued_at_0,
                                                     expiry_0,
                                                     issuer_0,
                                                     patient_name_0,
                                                     condition_0,
                                                     treatment_0,
                                                     disclose_fields_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      record_verification: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`record_verification: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const client_0 = args_1[1];
        const credential_hash_0 = args_1[2];
        const timestamp_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('record_verification',
                                      'argument 1 (as invoked from Typescript)',
                                      'careproof.compact line 246 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(client_0) === 'object' && client_0.bytes.buffer instanceof ArrayBuffer && client_0.bytes.BYTES_PER_ELEMENT === 1 && client_0.bytes.length === 32)) {
          __compactRuntime.type_error('record_verification',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'careproof.compact line 246 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      client_0)
        }
        if (!(credential_hash_0.buffer instanceof ArrayBuffer && credential_hash_0.BYTES_PER_ELEMENT === 1 && credential_hash_0.length === 32)) {
          __compactRuntime.type_error('record_verification',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'careproof.compact line 246 char 1',
                                      'Bytes<32>',
                                      credential_hash_0)
        }
        if (!(typeof(timestamp_0) === 'bigint' && timestamp_0 >= 0n && timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.type_error('record_verification',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'careproof.compact line 246 char 1',
                                      'Uint<0..18446744073709551615>',
                                      timestamp_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(client_0).concat(_descriptor_1.toValue(credential_hash_0).concat(_descriptor_3.toValue(timestamp_0))),
            alignment: _descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._record_verification_0(context,
                                                     partialProofData,
                                                     client_0,
                                                     credential_hash_0,
                                                     timestamp_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      add_doctor: this.circuits.add_doctor,
      remove_doctor: this.circuits.remove_doctor,
      add_verifier: this.circuits.add_verifier,
      remove_verifier: this.circuits.remove_verifier,
      toggle_pause: this.circuits.toggle_pause,
      issue_credential: this.circuits.issue_credential,
      disclose_credential: this.circuits.disclose_credential,
      record_verification: this.circuits.record_verification
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('add_doctor', new __compactRuntime.ContractOperation());
    state_0.setOperation('remove_doctor', new __compactRuntime.ContractOperation());
    state_0.setOperation('add_verifier', new __compactRuntime.ContractOperation());
    state_0.setOperation('remove_verifier', new __compactRuntime.ContractOperation());
    state_0.setOperation('toggle_pause', new __compactRuntime.ContractOperation());
    state_0.setOperation('issue_credential', new __compactRuntime.ContractOperation());
    state_0.setOperation('disclose_credential', new __compactRuntime.ContractOperation());
    state_0.setOperation('record_verification', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(0n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue({ bytes: new Uint8Array(32) }),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(1n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(2n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(3n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(4n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(5n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newArray()
                                        .arrayPush(__compactRuntime.StateValue.newBoundedMerkleTree(
                                                     new __compactRuntime.StateBoundedMerkleTree(16)
                                                   )).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                      alignment: _descriptor_3.alignment() }))
                                        .encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(6n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(7n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(8n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                            alignment: _descriptor_3.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(9n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                            alignment: _descriptor_3.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = this._ownPublicKey_0(context, partialProofData);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(0n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(1n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _ownPublicKey_0(context, partialProofData) {
    const result_0 = __compactRuntime.ownPublicKey(context);
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _compute_credential_hash_0(cred_0) { return this._persistentHash_0(cred_0); }
  _compute_credential_key_0(client_0, id_0) {
    const key_0 = { client: client_0, id: id_0 };
    return this._persistentHash_1(key_0);
  }
  _add_doctor_0(context, partialProofData, doctor_0) {
    __compactRuntime.assert(this._equal_0(this._ownPublicKey_0(context,
                                                               partialProofData),
                                          _descriptor_2.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_4.toValue(0n),
                                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value)),
                            'Only admin can call');
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(2n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(doctor_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(true),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _remove_doctor_0(context, partialProofData, doctor_0) {
    __compactRuntime.assert(this._equal_1(this._ownPublicKey_0(context,
                                                               partialProofData),
                                          _descriptor_2.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_4.toValue(0n),
                                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value)),
                            'Only admin can call');
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(2n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(doctor_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _add_verifier_0(context, partialProofData, verifier_0) {
    __compactRuntime.assert(this._equal_2(this._ownPublicKey_0(context,
                                                               partialProofData),
                                          _descriptor_2.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_4.toValue(0n),
                                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value)),
                            'Only admin can call');
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(3n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(verifier_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(true),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _remove_verifier_0(context, partialProofData, verifier_0) {
    __compactRuntime.assert(this._equal_3(this._ownPublicKey_0(context,
                                                               partialProofData),
                                          _descriptor_2.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_4.toValue(0n),
                                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value)),
                            'Only admin can call');
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(3n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(verifier_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _toggle_pause_0(context, partialProofData) {
    __compactRuntime.assert(this._equal_4(this._ownPublicKey_0(context,
                                                               partialProofData),
                                          _descriptor_2.fromValue(Contract._query(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_4.toValue(0n),
                                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value)),
                            'Only admin can call');
    const tmp_0 = !_descriptor_0.fromValue(Contract._query(context,
                                                           partialProofData,
                                                           [
                                                            { dup: { n: 0 } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_4.toValue(1n),
                                                                                       alignment: _descriptor_4.alignment() } }] } },
                                                            { popeq: { cached: false,
                                                                       result: undefined } }]).value);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(1n),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _issue_credential_0(context,
                      partialProofData,
                      credential_type_0,
                      id_0,
                      issued_at_0,
                      expiry_0,
                      client_0,
                      patient_name_0,
                      condition_0,
                      treatment_0)
  {
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    const issuer_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_4.toValue(2n),
                                                                                                alignment: _descriptor_4.alignment() } }] } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_2.toValue(issuer_0),
                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                     { popeq: { cached: false,
                                                                                result: undefined } }]).value),
                            'Only doctors can issue credentials');
    const credential_0 = { id: id_0,
                           credential_type: credential_type_0,
                           issuer: issuer_0,
                           issued_at: issued_at_0,
                           expiry: expiry_0,
                           patient_name: patient_name_0,
                           condition: condition_0,
                           treatment: treatment_0 };
    const cred_hash_0 = this._persistentHash_0(credential_0);
    const composite_key_0 = this._persistentHash_1({ client: client_0, id: id_0 });
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(4n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(composite_key_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(cred_hash_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(5n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(0n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { dup: { n: 2 } },
                     { idx: { cached: false,
                              pushPath: false,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(1n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                            { value: _descriptor_1.toValue(cred_hash_0),
                                                                              alignment: _descriptor_1.alignment() }
                                                                          )).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } },
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(1n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { addi: { immediate: 1 } },
                     { ins: { cached: true, n: 2 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(8n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_9.toValue(tmp_0),
                                              alignment: _descriptor_9.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _disclose_credential_0(context,
                         partialProofData,
                         credential_type_0,
                         id_0,
                         issued_at_0,
                         expiry_0,
                         issuer_0,
                         patient_name_0,
                         condition_0,
                         treatment_0,
                         disclose_fields_0)
  {
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    const client_0 = this._ownPublicKey_0(context, partialProofData);
    const credential_0 = { id: id_0,
                           credential_type: credential_type_0,
                           issuer: issuer_0,
                           issued_at: issued_at_0,
                           expiry: expiry_0,
                           patient_name: patient_name_0,
                           condition: condition_0,
                           treatment: treatment_0 };
    const cred_hash_0 = this._persistentHash_0(credential_0);
    const composite_key_0 = this._persistentHash_1({ client: client_0, id: id_0 });
    const stored_hash_0 = _descriptor_1.fromValue(Contract._query(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_4.toValue(4n),
                                                                                              alignment: _descriptor_4.alignment() } }] } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_1.toValue(composite_key_0),
                                                                                              alignment: _descriptor_1.alignment() } }] } },
                                                                   { popeq: { cached: false,
                                                                              result: undefined } }]).value);
    __compactRuntime.assert(this._equal_5(cred_hash_0, stored_hash_0),
                            'Credential hash mismatch');
    const empty_0 = Uint8Array.from([0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n,
                                     0n],
                                    Number);
    const disclosed_patient_name_0 = disclose_fields_0[0] ?
                                     patient_name_0 :
                                     empty_0;
    const disclosed_condition_0 = disclose_fields_0[1] ? condition_0 : empty_0;
    const disclosed_treatment_0 = disclose_fields_0[2] ? treatment_0 : empty_0;
    const disclosed_record_0 = { id: id_0,
                                 credential_type: credential_type_0,
                                 issuer: issuer_0,
                                 issued_at: issued_at_0,
                                 expiry: expiry_0,
                                 patient_name: disclosed_patient_name_0,
                                 condition: disclosed_condition_0,
                                 treatment: disclosed_treatment_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(6n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(client_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(disclosed_record_0),
                                                                            alignment: _descriptor_6.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _record_verification_0(context,
                         partialProofData,
                         client_0,
                         credential_hash_0,
                         timestamp_0)
  {
    __compactRuntime.assert(!_descriptor_0.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value),
                            'Contract is paused');
    const verifier_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_0.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_4.toValue(3n),
                                                                                                alignment: _descriptor_4.alignment() } }] } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_2.toValue(verifier_0),
                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                     { popeq: { cached: false,
                                                                                result: undefined } }]).value),
                            'Only verifiers can record verifications');
    const record_0 = { verifier: verifier_0,
                       credential_hash: credential_hash_0,
                       timestamp: timestamp_0,
                       result: true };
    const log_key_0 = this._persistentHash_2({ verifier: verifier_0,
                                               credential_hash:
                                                 credential_hash_0 });
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(7n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(log_key_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(record_0),
                                                                            alignment: _descriptor_8.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_4.toValue(9n),
                                                alignment: _descriptor_4.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_9.toValue(tmp_0),
                                              alignment: _descriptor_9.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_1(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_2(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_3(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_4(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get admin() {
      return _descriptor_2.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_4.toValue(0n),
                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    get paused() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_4.toValue(1n),
                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    doctors: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(2n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(2n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'careproof.compact line 53 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(2n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'careproof.compact line 53 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(2n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(key_0),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    verifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(3n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(3n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'careproof.compact line 56 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(3n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'careproof.compact line 56 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(3n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(key_0),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    credential_hashes: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(4n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(4n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'careproof.compact line 61 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(4n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'careproof.compact line 61 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_1.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(4n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_1.toValue(key_0),
                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_1.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    credential_tree: {
      isFull(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isFull: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(5n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(1n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(65536n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'lt',
                                                        'neg',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      checkRoot(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`checkRoot: expected 1 argument, received ${args_0.length}`);
        }
        const rt_0 = args_0[0];
        if (!(typeof(rt_0) === 'object' && typeof(rt_0.field) === 'bigint' && rt_0.field >= 0 && rt_0.field <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.type_error('checkRoot',
                                      'argument 1',
                                      'careproof.compact line 65 char 1',
                                      'struct MerkleTreeDigest<field: Field>',
                                      rt_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(5n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(0n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'root',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(rt_0),
                                                                                                               alignment: _descriptor_14.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      root(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`root: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return new __compactRuntime.CompactTypeMerkleTreeDigest().fromValue(self_0.asArray()[0].asBoundedMerkleTree().root());
      },
      firstFree(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`first_free: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return new __compactRuntime.CompactTypeField().fromValue(self_0.asArray()[1].asCell().value);
      },
      pathForLeaf(...args_0) {
        if (args_0.length !== 2) {
          throw new __compactRuntime.CompactError(`path_for_leaf: expected 2 arguments, received ${args_0.length}`);
        }
        const index_0 = args_0[0];
        const leaf_0 = args_0[1];
        if (!(typeof(index_0) === 'bigint' && index_0 >= 0 && index_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.type_error('path_for_leaf',
                                      'argument 1',
                                      'careproof.compact line 65 char 1',
                                      'Field',
                                      index_0)
        }
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.type_error('path_for_leaf',
                                      'argument 2',
                                      'careproof.compact line 65 char 1',
                                      'Bytes<32>',
                                      leaf_0)
        }
        const self_0 = state.asArray()[5];
        return new __compactRuntime.CompactTypeMerkleTreePath(16, _descriptor_1).fromValue(  self_0.asArray()[0].asBoundedMerkleTree().pathForLeaf(    index_0,    {      value: _descriptor_1.toValue(leaf_0),      alignment: _descriptor_1.alignment()    }  ).value);
      },
      findPathForLeaf(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`find_path_for_leaf: expected 1 argument, received ${args_0.length}`);
        }
        const leaf_0 = args_0[0];
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.type_error('find_path_for_leaf',
                                      'argument 1',
                                      'careproof.compact line 65 char 1',
                                      'Bytes<32>',
                                      leaf_0)
        }
        const self_0 = state.asArray()[5];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(16, _descriptor_1).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().findPathForLeaf(    {      value: _descriptor_1.toValue(leaf_0),      alignment: _descriptor_1.alignment()    }  )?.value);
      }
    },
    disclosed_credentials: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(6n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(6n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'careproof.compact line 68 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(6n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'careproof.compact line 68 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      key_0)
        }
        return _descriptor_6.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(6n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(key_0),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[6];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    verification_log: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(7n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(7n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'careproof.compact line 72 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(7n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'careproof.compact line 72 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_8.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_4.toValue(7n),
                                                                                   alignment: _descriptor_4.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_1.toValue(key_0),
                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[7];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get total_credentials() {
      return _descriptor_3.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_4.toValue(8n),
                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    get total_verifications() {
      return _descriptor_3.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_4.toValue(9n),
                                                                                 alignment: _descriptor_4.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = {
  compute_credential_hash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`compute_credential_hash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const cred_0 = args_0[0];
    if (!(typeof(cred_0) === 'object' && typeof(cred_0.id) === 'bigint' && cred_0.id >= 0n && cred_0.id <= 18446744073709551615n && typeof(cred_0.credential_type) === 'bigint' && cred_0.credential_type >= 0n && cred_0.credential_type <= 255n && typeof(cred_0.issuer) === 'object' && cred_0.issuer.bytes.buffer instanceof ArrayBuffer && cred_0.issuer.bytes.BYTES_PER_ELEMENT === 1 && cred_0.issuer.bytes.length === 32 && typeof(cred_0.issued_at) === 'bigint' && cred_0.issued_at >= 0n && cred_0.issued_at <= 18446744073709551615n && typeof(cred_0.expiry) === 'bigint' && cred_0.expiry >= 0n && cred_0.expiry <= 18446744073709551615n && cred_0.patient_name.buffer instanceof ArrayBuffer && cred_0.patient_name.BYTES_PER_ELEMENT === 1 && cred_0.patient_name.length === 128 && cred_0.condition.buffer instanceof ArrayBuffer && cred_0.condition.BYTES_PER_ELEMENT === 1 && cred_0.condition.length === 128 && cred_0.treatment.buffer instanceof ArrayBuffer && cred_0.treatment.BYTES_PER_ELEMENT === 1 && cred_0.treatment.length === 128)) {
      __compactRuntime.type_error('compute_credential_hash',
                                  'argument 1',
                                  'careproof.compact line 90 char 1',
                                  'struct Credential<id: Uint<0..18446744073709551615>, credential_type: Uint<0..255>, issuer: struct ZswapCoinPublicKey<bytes: Bytes<32>>, issued_at: Uint<0..18446744073709551615>, expiry: Uint<0..18446744073709551615>, patient_name: Bytes<128>, condition: Bytes<128>, treatment: Bytes<128>>',
                                  cred_0)
    }
    return _dummyContract._compute_credential_hash_0(cred_0);
  },
  compute_credential_key: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`compute_credential_key: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const client_0 = args_0[0];
    const id_0 = args_0[1];
    if (!(typeof(client_0) === 'object' && client_0.bytes.buffer instanceof ArrayBuffer && client_0.bytes.BYTES_PER_ELEMENT === 1 && client_0.bytes.length === 32)) {
      __compactRuntime.type_error('compute_credential_key',
                                  'argument 1',
                                  'careproof.compact line 94 char 1',
                                  'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                  client_0)
    }
    if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('compute_credential_key',
                                  'argument 2',
                                  'careproof.compact line 94 char 1',
                                  'Uint<0..18446744073709551615>',
                                  id_0)
    }
    return _dummyContract._compute_credential_key_0(client_0, id_0);
  }
};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
