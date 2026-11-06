type Method = (...args: never[]) => unknown;

type MethodKey<T> = {
  [K in keyof T]: T[K] extends Method ? K : never;
}[keyof T];

export type RestoreMethod = () => void;

export const guardMethod = <T extends object, K extends MethodKey<T>>(
  target: T,
  name: K,
  isAllowed: (target: T) => boolean,
): RestoreMethod => {
  const hadOwn = Object.hasOwn(target, name);
  const previous = target[name];
  const original = previous as Method;

  const guarded = function (this: T, ...args: never[]) {
    if (!isAllowed(target)) return undefined;
    return original.apply(this, args);
  };
  target[name] = guarded as T[K];

  return () => {
    if (hadOwn) {
      target[name] = previous;
      return;
    }
    delete target[name];
  };
};
