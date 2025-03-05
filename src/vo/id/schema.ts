export interface IDSchema {
    sortable?: boolean;
    specifiedRandValue?: Uint8Array;
    specifiedMsecs?: number;
    specifiedSeq?: number;
    specifiedRng?: () => Uint8Array;
    offset?: number;
}

export type FilledIDSchema = {
    sortable: boolean;
    specifiedRandValue?: Uint8Array;
    specifiedMsecs?: number;
    specifiedSeq?: number;
    specifiedRng?: () => Uint8Array;
    offset?: number;
}