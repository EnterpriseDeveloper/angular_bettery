// @ts-nocheck
/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal'
import * as Long from 'long'

export const protobufPackage = 'VoroshilovMax.bettery.privateevents'

/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreateValidPrivEvents {
  creator: string
  privId: number
  answer: string
}

export interface MsgCreateValidPrivEventsResponse {
  id: number
}

export interface MsgCreatePartPrivEvents {
  creator: string
  privId: number
  answer: string
}

export interface MsgCreatePartPrivEventsResponse {
  id: number
}

export interface MsgCreateCreatePrivEvents {
  creator: string
  privId: number
  question: string
  answers: string[]
  winner: string
  loser: string
  startTime: number
  endTime: number
  finished: boolean
}

export interface MsgCreateCreatePrivEventsResponse {
  id: number
}

const baseMsgCreateValidPrivEvents: object = { creator: '', privId: 0, answer: '' }

export const MsgCreateValidPrivEvents = {
  encode(message: MsgCreateValidPrivEvents, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.privId !== 0) {
      writer.uint32(16).uint64(message.privId)
    }
    if (message.answer !== '') {
      writer.uint32(26).string(message.answer)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateValidPrivEvents {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateValidPrivEvents } as MsgCreateValidPrivEvents
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.privId = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.answer = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateValidPrivEvents {
    const message = { ...baseMsgCreateValidPrivEvents } as MsgCreateValidPrivEvents
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = Number(object.privId)
    } else {
      message.privId = 0
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = String(object.answer)
    } else {
      message.answer = ''
    }
    return message
  },

  toJSON(message: MsgCreateValidPrivEvents): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.privId !== undefined && (obj.privId = message.privId)
    message.answer !== undefined && (obj.answer = message.answer)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateValidPrivEvents>): MsgCreateValidPrivEvents {
    const message = { ...baseMsgCreateValidPrivEvents } as MsgCreateValidPrivEvents
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = object.privId
    } else {
      message.privId = 0
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = object.answer
    } else {
      message.answer = ''
    }
    return message
  }
}

const baseMsgCreateValidPrivEventsResponse: object = { id: 0 }

export const MsgCreateValidPrivEventsResponse = {
  encode(message: MsgCreateValidPrivEventsResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateValidPrivEventsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateValidPrivEventsResponse } as MsgCreateValidPrivEventsResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateValidPrivEventsResponse {
    const message = { ...baseMsgCreateValidPrivEventsResponse } as MsgCreateValidPrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreateValidPrivEventsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateValidPrivEventsResponse>): MsgCreateValidPrivEventsResponse {
    const message = { ...baseMsgCreateValidPrivEventsResponse } as MsgCreateValidPrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgCreatePartPrivEvents: object = { creator: '', privId: 0, answer: '' }

export const MsgCreatePartPrivEvents = {
  encode(message: MsgCreatePartPrivEvents, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.privId !== 0) {
      writer.uint32(16).uint64(message.privId)
    }
    if (message.answer !== '') {
      writer.uint32(26).string(message.answer)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreatePartPrivEvents {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreatePartPrivEvents } as MsgCreatePartPrivEvents
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.privId = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.answer = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreatePartPrivEvents {
    const message = { ...baseMsgCreatePartPrivEvents } as MsgCreatePartPrivEvents
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = Number(object.privId)
    } else {
      message.privId = 0
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = String(object.answer)
    } else {
      message.answer = ''
    }
    return message
  },

  toJSON(message: MsgCreatePartPrivEvents): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.privId !== undefined && (obj.privId = message.privId)
    message.answer !== undefined && (obj.answer = message.answer)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreatePartPrivEvents>): MsgCreatePartPrivEvents {
    const message = { ...baseMsgCreatePartPrivEvents } as MsgCreatePartPrivEvents
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = object.privId
    } else {
      message.privId = 0
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = object.answer
    } else {
      message.answer = ''
    }
    return message
  }
}

const baseMsgCreatePartPrivEventsResponse: object = { id: 0 }

export const MsgCreatePartPrivEventsResponse = {
  encode(message: MsgCreatePartPrivEventsResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreatePartPrivEventsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreatePartPrivEventsResponse } as MsgCreatePartPrivEventsResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreatePartPrivEventsResponse {
    const message = { ...baseMsgCreatePartPrivEventsResponse } as MsgCreatePartPrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreatePartPrivEventsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreatePartPrivEventsResponse>): MsgCreatePartPrivEventsResponse {
    const message = { ...baseMsgCreatePartPrivEventsResponse } as MsgCreatePartPrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgCreateCreatePrivEvents: object = {
  creator: '',
  privId: 0,
  question: '',
  answers: '',
  winner: '',
  loser: '',
  startTime: 0,
  endTime: 0,
  finished: false
}

export const MsgCreateCreatePrivEvents = {
  encode(message: MsgCreateCreatePrivEvents, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.privId !== 0) {
      writer.uint32(16).uint64(message.privId)
    }
    if (message.question !== '') {
      writer.uint32(26).string(message.question)
    }
    for (const v of message.answers) {
      writer.uint32(34).string(v!)
    }
    if (message.winner !== '') {
      writer.uint32(42).string(message.winner)
    }
    if (message.loser !== '') {
      writer.uint32(50).string(message.loser)
    }
    if (message.startTime !== 0) {
      writer.uint32(56).uint64(message.startTime)
    }
    if (message.endTime !== 0) {
      writer.uint32(64).uint64(message.endTime)
    }
    if (message.finished === true) {
      writer.uint32(72).bool(message.finished)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateCreatePrivEvents {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateCreatePrivEvents } as MsgCreateCreatePrivEvents
    message.answers = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.privId = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.question = reader.string()
          break
        case 4:
          message.answers.push(reader.string())
          break
        case 5:
          message.winner = reader.string()
          break
        case 6:
          message.loser = reader.string()
          break
        case 7:
          message.startTime = longToNumber(reader.uint64() as Long)
          break
        case 8:
          message.endTime = longToNumber(reader.uint64() as Long)
          break
        case 9:
          message.finished = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateCreatePrivEvents {
    const message = { ...baseMsgCreateCreatePrivEvents } as MsgCreateCreatePrivEvents
    message.answers = []
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = Number(object.privId)
    } else {
      message.privId = 0
    }
    if (object.question !== undefined && object.question !== null) {
      message.question = String(object.question)
    } else {
      message.question = ''
    }
    if (object.answers !== undefined && object.answers !== null) {
      for (const e of object.answers) {
        message.answers.push(String(e))
      }
    }
    if (object.winner !== undefined && object.winner !== null) {
      message.winner = String(object.winner)
    } else {
      message.winner = ''
    }
    if (object.loser !== undefined && object.loser !== null) {
      message.loser = String(object.loser)
    } else {
      message.loser = ''
    }
    if (object.startTime !== undefined && object.startTime !== null) {
      message.startTime = Number(object.startTime)
    } else {
      message.startTime = 0
    }
    if (object.endTime !== undefined && object.endTime !== null) {
      message.endTime = Number(object.endTime)
    } else {
      message.endTime = 0
    }
    if (object.finished !== undefined && object.finished !== null) {
      message.finished = Boolean(object.finished)
    } else {
      message.finished = false
    }
    return message
  },

  toJSON(message: MsgCreateCreatePrivEvents): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.privId !== undefined && (obj.privId = message.privId)
    message.question !== undefined && (obj.question = message.question)
    if (message.answers) {
      obj.answers = message.answers.map((e) => e)
    } else {
      obj.answers = []
    }
    message.winner !== undefined && (obj.winner = message.winner)
    message.loser !== undefined && (obj.loser = message.loser)
    message.startTime !== undefined && (obj.startTime = message.startTime)
    message.endTime !== undefined && (obj.endTime = message.endTime)
    message.finished !== undefined && (obj.finished = message.finished)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateCreatePrivEvents>): MsgCreateCreatePrivEvents {
    const message = { ...baseMsgCreateCreatePrivEvents } as MsgCreateCreatePrivEvents
    message.answers = []
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.privId !== undefined && object.privId !== null) {
      message.privId = object.privId
    } else {
      message.privId = 0
    }
    if (object.question !== undefined && object.question !== null) {
      message.question = object.question
    } else {
      message.question = ''
    }
    if (object.answers !== undefined && object.answers !== null) {
      for (const e of object.answers) {
        message.answers.push(e)
      }
    }
    if (object.winner !== undefined && object.winner !== null) {
      message.winner = object.winner
    } else {
      message.winner = ''
    }
    if (object.loser !== undefined && object.loser !== null) {
      message.loser = object.loser
    } else {
      message.loser = ''
    }
    if (object.startTime !== undefined && object.startTime !== null) {
      message.startTime = object.startTime
    } else {
      message.startTime = 0
    }
    if (object.endTime !== undefined && object.endTime !== null) {
      message.endTime = object.endTime
    } else {
      message.endTime = 0
    }
    if (object.finished !== undefined && object.finished !== null) {
      message.finished = object.finished
    } else {
      message.finished = false
    }
    return message
  }
}

const baseMsgCreateCreatePrivEventsResponse: object = { id: 0 }

export const MsgCreateCreatePrivEventsResponse = {
  encode(message: MsgCreateCreatePrivEventsResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateCreatePrivEventsResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateCreatePrivEventsResponse } as MsgCreateCreatePrivEventsResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateCreatePrivEventsResponse {
    const message = { ...baseMsgCreateCreatePrivEventsResponse } as MsgCreateCreatePrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreateCreatePrivEventsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateCreatePrivEventsResponse>): MsgCreateCreatePrivEventsResponse {
    const message = { ...baseMsgCreateCreatePrivEventsResponse } as MsgCreateCreatePrivEventsResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

/** Msg defines the Msg service. */
export interface Msg {
  /** this line is used by starport scaffolding # proto/tx/rpc */
  CreateValidPrivEvents(request: MsgCreateValidPrivEvents): Promise<MsgCreateValidPrivEventsResponse>
  CreatePartPrivEvents(request: MsgCreatePartPrivEvents): Promise<MsgCreatePartPrivEventsResponse>
  CreateCreatePrivEvents(request: MsgCreateCreatePrivEvents): Promise<MsgCreateCreatePrivEventsResponse>
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc
  constructor(rpc: Rpc) {
    this.rpc = rpc
  }
  CreateValidPrivEvents(request: MsgCreateValidPrivEvents): Promise<MsgCreateValidPrivEventsResponse> {
    const data = MsgCreateValidPrivEvents.encode(request).finish()
    const promise = this.rpc.request('VoroshilovMax.bettery.privateevents.Msg', 'CreateValidPrivEvents', data)
    return promise.then((data) => MsgCreateValidPrivEventsResponse.decode(new Reader(data)))
  }

  CreatePartPrivEvents(request: MsgCreatePartPrivEvents): Promise<MsgCreatePartPrivEventsResponse> {
    const data = MsgCreatePartPrivEvents.encode(request).finish()
    const promise = this.rpc.request('VoroshilovMax.bettery.privateevents.Msg', 'CreatePartPrivEvents', data)
    return promise.then((data) => MsgCreatePartPrivEventsResponse.decode(new Reader(data)))
  }

  CreateCreatePrivEvents(request: MsgCreateCreatePrivEvents): Promise<MsgCreateCreatePrivEventsResponse> {
    const data = MsgCreateCreatePrivEvents.encode(request).finish()
    const promise = this.rpc.request('VoroshilovMax.bettery.privateevents.Msg', 'CreateCreatePrivEvents', data)
    return promise.then((data) => MsgCreateCreatePrivEventsResponse.decode(new Reader(data)))
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>
}

declare var self: any | undefined
declare var window: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw 'Unable to locate global object'
})()

type Builtin = Date | Function | Uint8Array | string | number | undefined
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
