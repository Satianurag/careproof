import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  add_doctor(context: __compactRuntime.CircuitContext<T>,
             doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  remove_doctor(context: __compactRuntime.CircuitContext<T>,
                doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  add_verifier(context: __compactRuntime.CircuitContext<T>,
               verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  remove_verifier(context: __compactRuntime.CircuitContext<T>,
                  verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  toggle_pause(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  issue_credential(context: __compactRuntime.CircuitContext<T>,
                   credential_type_0: bigint,
                   id_0: bigint,
                   issued_at_0: bigint,
                   expiry_0: bigint,
                   client_0: { bytes: Uint8Array },
                   patient_name_0: Uint8Array,
                   condition_0: Uint8Array,
                   treatment_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  disclose_credential(context: __compactRuntime.CircuitContext<T>,
                      credential_type_0: bigint,
                      id_0: bigint,
                      issued_at_0: bigint,
                      expiry_0: bigint,
                      issuer_0: { bytes: Uint8Array },
                      patient_name_0: Uint8Array,
                      condition_0: Uint8Array,
                      treatment_0: Uint8Array,
                      disclose_fields_0: [boolean, boolean, boolean]): __compactRuntime.CircuitResults<T, []>;
  record_verification(context: __compactRuntime.CircuitContext<T>,
                      client_0: { bytes: Uint8Array },
                      credential_hash_0: Uint8Array,
                      timestamp_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
  compute_credential_hash(cred_0: { id: bigint,
                                    credential_type: bigint,
                                    issuer: { bytes: Uint8Array },
                                    issued_at: bigint,
                                    expiry: bigint,
                                    patient_name: Uint8Array,
                                    condition: Uint8Array,
                                    treatment: Uint8Array
                                  }): Uint8Array;
  compute_credential_key(client_0: { bytes: Uint8Array }, id_0: bigint): Uint8Array;
}

export type Circuits<T> = {
  compute_credential_hash(context: __compactRuntime.CircuitContext<T>,
                          cred_0: { id: bigint,
                                    credential_type: bigint,
                                    issuer: { bytes: Uint8Array },
                                    issued_at: bigint,
                                    expiry: bigint,
                                    patient_name: Uint8Array,
                                    condition: Uint8Array,
                                    treatment: Uint8Array
                                  }): __compactRuntime.CircuitResults<T, Uint8Array>;
  compute_credential_key(context: __compactRuntime.CircuitContext<T>,
                         client_0: { bytes: Uint8Array },
                         id_0: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
  add_doctor(context: __compactRuntime.CircuitContext<T>,
             doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  remove_doctor(context: __compactRuntime.CircuitContext<T>,
                doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  add_verifier(context: __compactRuntime.CircuitContext<T>,
               verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  remove_verifier(context: __compactRuntime.CircuitContext<T>,
                  verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<T, []>;
  toggle_pause(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  issue_credential(context: __compactRuntime.CircuitContext<T>,
                   credential_type_0: bigint,
                   id_0: bigint,
                   issued_at_0: bigint,
                   expiry_0: bigint,
                   client_0: { bytes: Uint8Array },
                   patient_name_0: Uint8Array,
                   condition_0: Uint8Array,
                   treatment_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  disclose_credential(context: __compactRuntime.CircuitContext<T>,
                      credential_type_0: bigint,
                      id_0: bigint,
                      issued_at_0: bigint,
                      expiry_0: bigint,
                      issuer_0: { bytes: Uint8Array },
                      patient_name_0: Uint8Array,
                      condition_0: Uint8Array,
                      treatment_0: Uint8Array,
                      disclose_fields_0: [boolean, boolean, boolean]): __compactRuntime.CircuitResults<T, []>;
  record_verification(context: __compactRuntime.CircuitContext<T>,
                      client_0: { bytes: Uint8Array },
                      credential_hash_0: Uint8Array,
                      timestamp_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly admin: { bytes: Uint8Array };
  readonly paused: boolean;
  doctors: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: { bytes: Uint8Array }): boolean;
    lookup(key_0: { bytes: Uint8Array }): boolean;
    [Symbol.iterator](): Iterator<[{ bytes: Uint8Array }, boolean]>
  };
  verifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: { bytes: Uint8Array }): boolean;
    lookup(key_0: { bytes: Uint8Array }): boolean;
    [Symbol.iterator](): Iterator<[{ bytes: Uint8Array }, boolean]>
  };
  credential_hashes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  credential_tree: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
  disclosed_credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: { bytes: Uint8Array }): boolean;
    lookup(key_0: { bytes: Uint8Array }): { id: bigint,
                                            credential_type: bigint,
                                            issuer: { bytes: Uint8Array },
                                            issued_at: bigint,
                                            expiry: bigint,
                                            patient_name: Uint8Array,
                                            condition: Uint8Array,
                                            treatment: Uint8Array
                                          };
    [Symbol.iterator](): Iterator<[{ bytes: Uint8Array }, { id: bigint,
  credential_type: bigint,
  issuer: { bytes: Uint8Array },
  issued_at: bigint,
  expiry: bigint,
  patient_name: Uint8Array,
  condition: Uint8Array,
  treatment: Uint8Array
}]>
  };
  verification_log: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { verifier: { bytes: Uint8Array },
                                 credential_hash: Uint8Array,
                                 timestamp: bigint,
                                 result: boolean
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { verifier: { bytes: Uint8Array },
  credential_hash: Uint8Array,
  timestamp: bigint,
  result: boolean
}]>
  };
  readonly total_credentials: bigint;
  readonly total_verifications: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
