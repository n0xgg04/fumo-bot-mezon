import { Injectable, Logger } from '@nestjs/common';

import {
  ApiMessageReaction,
  MezonClient,
  Events,
  ChannelMessage,
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  UserChannelAddedEvent,
  UserChannelRemovedEvent,
  UserClanRemovedEvent,
} from 'mezon-sdk';
import { MezonService } from '../mezon/mezon.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);
  private readonly client: MezonClient;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mezonService: MezonService,
  ) {
    this.client = mezonService.getClient();
  }

  initEvent() {
    for (const event in Events) {
      const eventValue = Events[event].replace(/_event/g, '').replace(/_/g, '');
      this.logger.log(`Init event ${eventValue}`);
      const key = `handle${eventValue}`;
      if (key in this) {
        this.client.on(Events[event], this[key], this);
      }
    }
  }
  // processMessage(msg: ChannelMessage) {}

  /* cspell:words handlemessagereaction */
  handlemessagereaction = async (msg: ApiMessageReaction) => {
    console.log('message reaction event');
    this.eventEmitter.emit(Events.MessageReaction, msg);
  };

  /* cspell:words handlechannelcreated */
  handlechannelcreated = async (channel: ChannelCreatedEvent) => {
    console.log('channel created event', channel);
    this.eventEmitter.emit(Events.ChannelCreated, channel);
  };

  /* cspell:words handleuserclanremoved */
  handleuserclanremoved = async (user: UserClanRemovedEvent) => {
    console.log('user clan removed event', user);
    this.eventEmitter.emit(Events.UserClanRemoved, user);
  };

  /* cspell:words handlerole */
  handlerole = async (msg) => {
    console.log('role event', msg);
  };

  /* cspell:words handleroleassign */
  handleroleassign = async (msg) => {
    console.log('role event assign', msg);
  };

  /* cspell:words handleuserchanneladded */
  handleuserchanneladded = async (user: UserChannelAddedEvent) => {
    console.log('user channel added event', user);
    this.eventEmitter.emit(Events.UserChannelAdded, user);
  };

  /* cspell:words handlechanneldeleted */
  handlechanneldeleted = async (channel: ChannelDeletedEvent) => {
    console.log('channel deleted event', channel);
    this.eventEmitter.emit(Events.ChannelDeleted, channel);
  };

  /* cspell:words handlechannelupdated */
  handlechannelupdated = async (channel: ChannelUpdatedEvent) => {
    console.log('channel updated event', channel);
    this.eventEmitter.emit(Events.ChannelUpdated, channel);
  };

  /* cspell:words handleuserchannelremoved */
  handleuserchannelremoved = async (msg: UserChannelRemovedEvent) => {
    console.log('user channel removed event');
    this.eventEmitter.emit(Events.UserChannelRemoved, msg);
  };

  /* cspell:words handlegivecoffee */
  handlegivecoffee = async (data) => {
    console.log('give coffee event', data);
    this.eventEmitter.emit(Events.GiveCoffee, data);
  };

  /* cspell:words handleaddclanuser */
  handleaddclanuser = async (data) => {
    console.log('add clan user event', data);
    this.eventEmitter.emit(Events.AddClanUser, data);
  };

  /* cspell:words handleroleassigned */
  handleroleassigned = async (msg) => {
    console.log('role assigned event', msg);
  };

  /* cspell:words handlemessagebuttonclicked */
  handlemessagebuttonclicked = (data) => {
    this.eventEmitter.emit(Events.MessageButtonClicked, data);
  };

  /* cspell:words handlechannelmessage */
  handlechannelmessage = async (msg: ChannelMessage) => {
    console.log('channel message event');

    if (msg.code) return; // ignored edited message
    ['attachments', 'mentions', 'references'].forEach((key) => {
      if (!Array.isArray(msg[key])) msg[key] = [];
    });
    this.eventEmitter.emit(Events.ChannelMessage, msg);
  };
}
