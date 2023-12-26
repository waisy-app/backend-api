import {isObjectLike as isObjectLike} from 'graphql/jsutils/isObjectLike'

export function isGeneralObject(value: unknown): value is Record<string, unknown> {
  return isObjectLike(value)
}
