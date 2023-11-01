import {ConditionalPickDeep} from './conditional-pick-deep';
import {type ConditionalSimplifyDeep} from './conditional-simplify';
import type {BuildObject} from './internal';
import {type RequiredObjectDeep} from './required-deep';
import type {Simplify} from './simplify.d';
import type {UnionToIntersection} from './union-to-intersection.d';
import type {UnknownRecord} from './unknown-record.d';

/**
Generate a union of all the possible paths in a deeply nested object.
*/
type Paths<T extends Record<string, unknown>, RecordType = RequiredObjectDeep<T>> =
{
	[Key in keyof RecordType]: RecordType[Key] extends Record<string, unknown>
		? Key extends string | number
			? Paths<never, RecordType[Key]> extends string | number
				? Key | `${Key}.${Paths<never, RecordType[Key]>}`
				: Key
			: Key
		: Key;
}[keyof RecordType];

/**
Returns a boolean for whether the given key is optional of the given object.
*/
type IsOptional<
	T extends UnknownRecord,
	Key extends keyof RecordType,
	RecordType = Pick<T, Key>> =
RecordType extends {[K in keyof RecordType]-?: RecordType[K]} ? false : true;

/**
Pick subsets of properties from a deeply nested object.

Use-case: You can use the type to filter the parts of a complex object that you focus on.

@example
```
import type {PickDeep} from 'type-fest';

type Configuration = {
  userConfig: {
    name: string;
    age: number;
    address: {
      street: string;
      city: string;
    };
  };
  appConfig: {
    theme: string;
    locale: string;
  };
  otherConfig: any;
};

type Address = PickDeep<Configuration, 'userConfig.address'>;
//=> type AddressConfig = { userConfig: { address: { street: string; city: string; }; }; }

type User = PickDeep<Configuration, 'userConfig.name' | 'userConfig.age'>;
//=> type User = { userConfig: { name: string; age: number; }; }

```

@see https://github.com/argentlabs/argent-x/blob/0cb22f7bb5b0045d8f0aebb22ee245bd59f5db8c/packages/extension/src/shared/types/deepPick.ts#L27
@category Object
*/
export type PickDeep<
	RecordType extends Record<string, unknown>,
	_PathUnion extends Paths<RecordType>, // UnChecked paths, not used here
	PathUnion extends string = Extract<Paths<RecordType>, _PathUnion>, // Checked paths, extracted from unChecked paths
> =
Simplify<UnionToIntersection<
{
	[P in PathUnion]:
	P extends `${infer RecordKeyInPath}.${infer SubPath}`
		? BuildObject<RecordKeyInPath, PickDeep<NonNullable<RecordType[RecordKeyInPath]>, never, SubPath>, IsOptional<RecordType, RecordKeyInPath>>
		: P extends keyof RecordType
			? BuildObject<P, RecordType[P], IsOptional<RecordType, P>>
			: never; // Should never happen
}[PathUnion]
>>;
