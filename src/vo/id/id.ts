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
import { IDValue } from "./value";

export class IDValueFactory {
    private _innerData: IDValue;
    private _schema: FilledIDSchema;

    static create(value?: IDValue, schema?: IDSchema): IDValueFactory {
        return new IDValueFactory(value, schema)
    }

    constructor(value?: IDValue, schema?: IDSchema) {
        this._schema = {
            sortable: schema?.sortable ?? defaultIDSortableOption,
        }
        if (value) {
            if (!IDValueFactory.validate(value, schema)) {
                throw new Error("Invalid ID value")
            }
            this._innerData = value
        } else {
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
    }

    static generate(schema?: IDSchema): IDValueFactory {
        return new IDValueFactory(undefined, schema)
    }

    get value(): string {
        return this._innerData
    }

    static validate(id: string, schema?: IDSchema): boolean {
        const mustVer = (schema?.sortable ?? defaultIDSortableOption) ? 7 : 4
        return uuidValidate(id) && uuidVersion(id) === mustVer
    }

    validate(): boolean {
        return IDValueFactory.validate(this._innerData, this._schema)
    }

    equals(other: IDValueFactory): boolean {
        return this._innerData === other._innerData
    }

    toString(): string {
        return this._innerData
    }

    lt(other: IDValueFactory): boolean {
        return this._schema.sortable ? this._innerData < other._innerData : false
    }

    lte(other: IDValueFactory): boolean {
        return this._schema.sortable ? this._innerData <= other._innerData : false
    }

    gt(other: IDValueFactory): boolean {
        return this._schema.sortable ? this._innerData > other._innerData : false
    }

    gte(other: IDValueFactory): boolean {
        return this._schema.sortable ? this._innerData >= other._innerData : false
    }
}