import type {BuildObject} from './internal';
import type {Paths} from './paths';
import type {Simplify} from './simplify.d';
import type {UnionToIntersection} from './union-to-intersection.d';
import {type UnknownArray} from './unknown-array';
import type {UnknownRecord} from './unknown-record.d';

type ToString<T> = T extends string | number ? `${T}` : never;

/**
Pick subsets of properties from a deeply-nested object.

Use-case: You can use the type to filter the parts of a complex object that you focus on.

@example
```
import type {PickDeep, PartialDeep} from 'type-fest';

type Configuration = {
	userConfig: {
		name: string;
		age: number;
		address: Array<{
			city: string;
			street: string;
		}>;
	};
	appConfig: {
		theme: string;
		locale: string;
	};
	otherConfig: any;
};

type Name = PickDeep<Configuration, 'userConfig.name'>;
//=> type AddressConfig = {
	userConfig: {
		address: {
			street: string;
			city: string;
		};
	};
}

// Also supports optional properties
type User = PickDeep<PartialDeep<Configuration>, 'userConfig.name' | 'userConfig.age'>;
//=> type User = {
	userConfig?: {
		name?: string;
		age?: number;
	};
};
```

@category Object
*/
export type PickDeep<
	RecordType extends UnknownRecord | UnknownArray,
	_PathUnion extends Paths<RecordType>, // Unchecked paths, not used here
	PathUnion extends string | number = Extract<Paths<RecordType>, _PathUnion>, // Checked paths, extracted from unchecked paths
> =
Simplify<UnionToIntersection<
{
	[P in PathUnion]:
	RecordType extends UnknownRecord
		?	P extends `${infer RecordKeyInPath}.${infer SubPath}`
			? BuildObject<RecordKeyInPath, PickDeep<NonNullable<RecordType[RecordKeyInPath]>, never, SubPath>, RecordType>
			: P extends keyof RecordType | `${ToString<keyof RecordType>}` // Handle number keys
				? Pick<RecordType, P>
				: never // Should never happen
		: RecordType extends UnknownArray
			?	P extends `${infer RecordKeyInPath}.${infer SubPath}`
				? number extends RecordKeyInPath
					? RecordType
					: any
				: P extends keyof RecordType | `${ToString<keyof RecordType>}` // Handle number keys
					? Pick<RecordType, P>
					: never // Should never happen
			: never
}[PathUnion]
>>;
