/* Utility Types */

import { AttributeSpec } from 'prosemirror-model';
import { ConditionalExcept, ConditionalPick } from 'type-fest';

/**
 * An alternative to keyof that only extracts the string keys.
 */
export type StringKey<Type> = Extract<keyof Type, string>;

/**
 * Extract the values of an object as a union type.
 *
 * @remarks
 *
 * ```ts
 * const myRecord = { A: 'a', B: 'b', C: 'c' } as const;
 *
 * type MyRecord = Value<typeof myRecord>; // 'a' | 'b' | 'c'
 * ```
 */
export type Value<Type> = Type[keyof Type];

/**
 * Makes a type nullable or undefined.
 */
export type Nullable<Type> = Type | null | undefined;

/**
 * Extract the values of a tuple as a union type.
 *
 * @remarks
 *
 * ```ts
 * const myTuple = ['a', 'b', 'c'] as const;
 *
 * type MyTuple = TupleValue<typeof myTuple>; // 'a' | 'b' | 'c'
 * ```
 */
export type TupleValue<Tuple extends readonly unknown[]> = Tuple[number];

/**
 * Creates a predicate type
 */
export type Predicate<Type> = (value: unknown) => value is Type;

declare const _brand: unique symbol;
declare const _flavor: unique symbol;

/**
 * Used by `Flavor` to mark a type in a readable way.
 */
interface Flavoring<Flavor> {
  readonly [_flavor]?: Flavor;
}

/**
 * Create a "flavored" version of a type. TypeScript will disallow mixing
 * flavors, but will allow unflavored values of that type to be passed in where
 * a flavored version is expected. This is a less restrictive form of branding.
 */
export type Flavor<Type, GFlavor> = Type & Flavoring<GFlavor>;

/**
 * Used by Brand to mark a type in a readable way.
 */
interface Branding<GBrand> {
  readonly [_brand]: GBrand;
}

/**
 * Create a "branded" version of a type. TypeScript won't allow implicit
 * conversion to this type
 */
export type Brand<Type, GBrand> = Type & Branding<GBrand>;

/**
 * An object with string keys and values of type `any`
 *
 * @remarks
 * Taken from `simplytyped`
 */
export interface PlainObject {
  [key: string]: unknown;
}

/**
 * Concisely and cleanly define an arbitrary function.
 *
 * @remarks
 * Taken from `simplytyped` Useful when designing many api's that don't care
 * what function they take in, they just need to know what it returns.
 */
export type AnyFunction<Type = any> = (...args: any[]) => Type;

/**
 * Matches any constructor type (but not of abstract classes).
 */
export type AnyConstructor<Type = unknown> = new (...args: any[]) => Type;

/**
 * Abstract classes don't support the builtin `InstanceType` helper. This is an
 * alternative which allows us to pull out the type of the prototype.
 */
export type AbstractInstanceType<
  GConstructor extends { prototype: any }
> = GConstructor['prototype'];

/**
 * Make the whole interface partial except for some specified keys which will be
 * made required.
 */
export type PartialWithRequiredKeys<Type extends object, Keys extends keyof Type> = Partial<
  Pick<Type, Exclude<keyof Type, Keys>>
> &
  Required<Pick<Type, Keys>>;

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]+?: Type[Key] };

/**
 * Makes specified keys of an interface nullable while the rest stay the same.
 */
export type MakeNullable<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]: Type[Key] | null };

/**
 * Makes specified keys of an interface Required while the rest remain
 * unchanged.
 */
export type MakeRequired<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]-?: Type[Key] };

/**
 * Makes specified keys of an interface readonly.
 */
export type MakeReadonly<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { +readonly [Key in Keys]: Type[Key] };

/**
 * All the literal types
 */
export type Literal = string | number | boolean | undefined | null | void | {};

/**
 * A recursive partial type. Useful for object that will be merged with
 * defaults.
 */
export type DeepPartial<Type> = Type extends object
  ? { [K in keyof Type]?: DeepPartial<Type[K]> }
  : Type;

/**
 * A tuple for use with the regex constructor.
 *
 * @remarks
 *
 * Can be spread as parameters for the `RegExp` constructor
 *
 * ```ts
 * const params: RegExpTuple = ['\\/awesome', 'gi']
 * const regexp = new RegExp(...params);
 * ```
 */
export type RegexTuple = [string, string?];

/**
 * A JSON representation of a prosemirror Mark
 */
export interface ObjectMark {
  type: string;
  attrs?: Record<string, string | null>;
}

/**
 * A JSON representation of the prosemirror Node.
 *
 * @remarks
 * This is used to represent the top level doc nodes content.
 */
export interface ObjectNode {
  type: string;
  marks?: Array<ObjectMark | string>;
  text?: string;
  content?: ObjectNode[];
  attrs?: Record<string, Literal | object>;
}

/**
 * Defines a position
 */
export interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Used for attributes which can be added to prosemirror nodes and marks.
 */
export type ProsemirrorAttributes<GExtra extends object = {}> = Record<string, unknown> & GExtra;

export type AttributesWithClass = ProsemirrorAttributes & { class?: string };

export interface ExtraAttributesObject {
  /**
   * The name of the attribute
   */
  name: string;

  /**
   * The default value for the attr, if left undefined then this becomes a
   * required. and must be provided whenever a node or mark of a type that has
   * them is created.
   */
  default?: string | null;

  /**
   * A function used to extract the attribute from the dom.
   */
  getAttributes?: (domNode: Node) => unknown;
}

/**
 * The first value is the name of the attribute the second value is the default
 * and the third is the optional parse name from the dom via
 * `node.getAttribute()`.
 */
export type ExtraAttributesTuple = [string, string, string?];

/**
 * Data representation tuple used for injecting extra attributes into an
 * extension.
 */
export type ExtraAttributes = string | ExtraAttributesTuple | ExtraAttributesObject;

/**
 * A method that can pull all the extraAttributes from the provided dom node.
 */
export type GetExtraAttributes = (domNode: Node) => Record<string, unknown>;

/**
 * A method that creates the `AttributeSpec` for prosemirror that can be added
 * to a node or mark extension to provide extra functionality and store more
 * information within the DOM and prosemirror state..
 *
 * @remarks
 *
 * ```ts
 * const schema = {
 *   attrs: {
 *      ...createExtraAttributes({ fallback: null }),
 *      href: {
 *       default: null,
 *     },
 *   },
 * }
 */
export type CreateExtraAttributes = (
  params: CreateExtraAttributesParams,
) => Record<string, AttributeSpec>;

interface CreateExtraAttributesParams {
  /**
   * The fallback value to use for the extra attributes being created. Must be
   * provided.
   */
  fallback: string | null;
}

/**
 * Defines the options that every extension can accept at instantiation.
 *
 * @remarks
 * Make sure to extend from this when defining custom options for your
 * extension.
 */

/**
 * The render environment which is either on the server (ssr) or in the dom.
 *
 * This is used to force a certain environment to override checks
 */
export type RenderEnvironment = 'ssr' | 'dom';

type NeverBrand = Brand<object, never>;

/**
 * Checks the type provided and if it has any properties which are required it
 * will return the `Then` type. When none of the properties are required it will
 * return the `Else` type.
 *
 * @remarks
 *
 * This is a reverse of the `IfNoRequiredProperties` type.
 */
export type IfHasRequiredProperties<Type extends object, Then, Else> = IfNoRequiredProperties<
  Type,
  Else,
  Then
>;

/**
 * A conditional check on the type. When there are no required keys it outputs
 * the `Then` type, otherwise it outputs the `Else` type.
 *
 * @remarks
 *
 * This is useful for dynamically setting the parameter list of a method call
 * dynamically depending on whether keys are required.
 */
export type IfNoRequiredProperties<Type extends object, Then, Else> = GetRequiredKeys<
  Type
> extends NeverBrand
  ? Then
  : Else;

/**
 * Get all the keys for required properties on this type.
 */
export type GetRequiredKeys<Type extends object> = keyof ConditionalPick<
  KeepPartialProperties<Type>,
  NeverBrand
>;

/**
 * Keeps the partial properties of a type unchanged. Transforms the rest to
 * `never`.
 *
 * TODO Instead of never why not try a unique brand type to prevent false
 * positives.
 */
export type KeepPartialProperties<Type extends object> = {
  [Key in keyof Type]: Type[Key] extends undefined ? Type[Key] : NeverBrand;
};

/**
 * Pick the `partial` properties from the provided Type and make them all
 * required.
 */
export type PickPartial<Type extends object> = {
  [Key in keyof ConditionalExcept<KeepPartialProperties<Type>, NeverBrand>]-?: Type[Key];
};

/**
 * Only pick the `required` (non-`partial`) types from the given `Type`.
 */
export type PickRequired<Type extends object> = {
  [Key in keyof ConditionalPick<KeepPartialProperties<Type>, NeverBrand>]: Type[Key];
};

/**
 * Reverses the partial and required keys for the type provided. If it was a
 * required property it becomes a partial property and if it was a partial
 * property it becomes a required property.
 */
export type FlipPartialAndRequired<Type extends object> = PickPartial<Type> &
  Partial<PickRequired<Type>>;

/**
 * Get the diff between two types. All identical keys are stripped away.
 *
 * @remarks
 *
 * ```ts
 * type Fun = Diff<{notFun: false, fun: true}, {notFun: true, wow: string}>;
 * // => { fun: true, wow: string }
 * ```
 */
export type Diff<A, B> = Omit<A, keyof B> & Omit<B, keyof A>;

/**
 * Conditional type which checks if the provided `Type` is and empty object (no properties). If it is
 * uses the `Then` type if not falls back to the `Else` type.
 */
export type IfEmpty<Type extends object, Then, Else> = keyof Type extends never ? Then : Else;

/**
 * Condition that checks if the keys of the two objects match. If so,
 * respond with `Then` otherwise `Else`.
 */
export type IfMatches<A, B, Then, Else> = IfEmpty<Diff<A, B>, Then, Else>;
