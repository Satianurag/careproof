import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  get_credential_commitment(context: __compactRuntime.WitnessContext<Ledger, PS>,
                            credential_id_0: bigint): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  add_doctor(context: __compactRuntime.CircuitContext<PS>,
             doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  add_verifier(context: __compactRuntime.CircuitContext<PS>,
               verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_verifier(context: __compactRuntime.CircuitContext<PS>,
                  verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  is_paused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  transfer_admin(context: __compactRuntime.CircuitContext<PS>,
                 new_admin_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  grant_consent(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array },
                credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_consent(context: __compactRuntime.CircuitContext<PS>,
                 doctor_0: { bytes: Uint8Array },
                 credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   credential_id_0: bigint,
                   client_0: { bytes: Uint8Array },
                   commitment_0: Uint8Array,
                   expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    credential_id_0: bigint,
                    client_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  prove_credential_ownership(context: __compactRuntime.CircuitContext<PS>,
                             credential_id_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  has_doctor_role(context: __compactRuntime.CircuitContext<PS>,
                  doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_verifier_role(context: __compactRuntime.CircuitContext<PS>,
                    verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_admin_role(context: __compactRuntime.CircuitContext<PS>,
                 account_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  add_doctor(context: __compactRuntime.CircuitContext<PS>,
             doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  add_verifier(context: __compactRuntime.CircuitContext<PS>,
               verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_verifier(context: __compactRuntime.CircuitContext<PS>,
                  verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  is_paused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  transfer_admin(context: __compactRuntime.CircuitContext<PS>,
                 new_admin_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  grant_consent(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array },
                credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_consent(context: __compactRuntime.CircuitContext<PS>,
                 doctor_0: { bytes: Uint8Array },
                 credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   credential_id_0: bigint,
                   client_0: { bytes: Uint8Array },
                   commitment_0: Uint8Array,
                   expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    credential_id_0: bigint,
                    client_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  prove_credential_ownership(context: __compactRuntime.CircuitContext<PS>,
                             credential_id_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  has_doctor_role(context: __compactRuntime.CircuitContext<PS>,
                  doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_verifier_role(context: __compactRuntime.CircuitContext<PS>,
                    verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_admin_role(context: __compactRuntime.CircuitContext<PS>,
                 account_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
  compute_credential_key(client_0: { bytes: Uint8Array }, id_0: bigint): Uint8Array;
}

export type Circuits<PS> = {
  add_doctor(context: __compactRuntime.CircuitContext<PS>,
             doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  add_verifier(context: __compactRuntime.CircuitContext<PS>,
               verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  remove_verifier(context: __compactRuntime.CircuitContext<PS>,
                  verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  is_paused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  transfer_admin(context: __compactRuntime.CircuitContext<PS>,
                 new_admin_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  grant_consent(context: __compactRuntime.CircuitContext<PS>,
                doctor_0: { bytes: Uint8Array },
                credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_consent(context: __compactRuntime.CircuitContext<PS>,
                 doctor_0: { bytes: Uint8Array },
                 credential_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   credential_id_0: bigint,
                   client_0: { bytes: Uint8Array },
                   commitment_0: Uint8Array,
                   expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    credential_id_0: bigint,
                    client_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  prove_credential_ownership(context: __compactRuntime.CircuitContext<PS>,
                             credential_id_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  compute_credential_key(context: __compactRuntime.CircuitContext<PS>,
                         client_0: { bytes: Uint8Array },
                         id_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  has_doctor_role(context: __compactRuntime.CircuitContext<PS>,
                  doctor_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_verifier_role(context: __compactRuntime.CircuitContext<PS>,
                    verifier_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
  has_admin_role(context: __compactRuntime.CircuitContext<PS>,
                 account_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly DOCTOR_ROLE: Uint8Array;
  readonly VERIFIER_ROLE: Uint8Array;
  credential_commitments: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined;
    history(): Iterator<__compactRuntime.MerkleTreeDigest>
  };
  credential_hashes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  active_credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  credential_expiry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  credential_issuer: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { bytes: Uint8Array };
    [Symbol.iterator](): Iterator<[Uint8Array, { bytes: Uint8Array }]>
  };
  revoked_credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  consent_registry: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  verification_log: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { verifier: { bytes: Uint8Array },
                                 commitment: Uint8Array,
                                 is_valid: boolean
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { verifier: { bytes: Uint8Array }, commitment: Uint8Array, is_valid: boolean }]>
  };
  readonly total_credentials: bigint;
  readonly total_verifications: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
