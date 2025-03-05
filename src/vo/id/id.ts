import { 
    v7 as uuidv7, 
    v4 as uuidv4, 
    Version7Options, 
    Version4Options, 
    validate as uuidValidate,
    version as uuidVersion,
} from "uuid";
import { FilledIDSchema, IDSchema } from "./schema";
import { defaultIDSortableOption } from "./const";

export class ID {
    private _innerData: string;
    private _schema: FilledIDSchema;

    static create(schema?: IDSchema): ID {
        return new ID(schema)
    }

    constructor(schema?: IDSchema) {
        this._schema = {
            sortable: schema?.sortable ?? defaultIDSortableOption,
        }
        if (this._schema.sortable) {
            const v7Options: Version7Options = {}
            if (schema?.specifiedRandValue !== undefined) {
                v7Options.random = schema.specifiedRandValue;
            } else if (schema?.specifiedRng !== undefined) {
                v7Options.rng = schema.specifiedRng;
            }
            if (schema?.specifiedMsecs !== undefined) {
                v7Options.msecs = schema.specifiedMsecs;
            }
            if (schema?.specifiedSeq !== undefined) {
                v7Options.seq = schema.specifiedSeq;
            }

            this._innerData = uuidv7(
                v7Options,
                undefined,
                schema?.offset
            )
        } else {
            const v4Options: Version4Options = {}
            if (schema?.specifiedRandValue !== undefined) {
                v4Options.random = schema.specifiedRandValue;
            } else if (schema?.specifiedRng !== undefined) {
                v4Options.rng = schema.specifiedRng;
            }

            this._innerData = uuidv4(
                v4Options,
                undefined,
                schema?.offset
            )
        }
    }

    get value(): string {
        return this._innerData
    }

    static validate(id: string, schema?: IDSchema): boolean {
        const mustVer = (schema?.sortable ?? defaultIDSortableOption) ? 7 : 4
        return uuidValidate(id) && uuidVersion(id) === mustVer
    }

    validate(): boolean {
        return ID.validate(this._innerData, this._schema)
    }

    equals(other: ID): boolean {
        return this._innerData === other._innerData
    }

    toString(): string {
        return this._innerData
    }

    lt(other: ID): boolean {
        return this._schema.sortable ? this._innerData < other._innerData : false
    }

    lte(other: ID): boolean {
        return this._schema.sortable ? this._innerData <= other._innerData : false
    }

    gt(other: ID): boolean {
        return this._schema.sortable ? this._innerData > other._innerData : false
    }

    gte(other: ID): boolean {
        return this._schema.sortable ? this._innerData >= other._innerData : false
    }
}