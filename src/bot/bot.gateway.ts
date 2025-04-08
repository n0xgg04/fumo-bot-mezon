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
  TokenSentEvent,
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
    this.client.on(Events.TokenSend, this.handletokensend, this);
  }
  // processMessage(msg: ChannelMessage) {}

  /* cspell:words handlemessagereaction */
  handlemessagereaction = async (msg: ApiMessageReaction) => {
    this.eventEmitter.emit(Events.MessageReaction, msg);
  };

  /* cspell:words handlechannelcreated */
  handlechannelcreated = async (channel: ChannelCreatedEvent) => {
    this.eventEmitter.emit(Events.ChannelCreated, channel);
  };

  /* cspell:words handleuserclanremoved */
  handleuserclanremoved = async (user: UserClanRemovedEvent) => {
    this.eventEmitter.emit(Events.UserClanRemoved, user);
  };

  /* cspell:words handlerole */
  handlerole = async (msg) => {};

  /* cspell:words handleroleassign */
  handleroleassign = async (msg) => {};

  /* cspell:words handleuserchanneladded */
  handleuserchanneladded = async (user: UserChannelAddedEvent) => {
    this.eventEmitter.emit(Events.UserChannelAdded, user);
  };

  /* cspell:words handlechanneldeleted */
  handlechanneldeleted = async (channel: ChannelDeletedEvent) => {
    this.eventEmitter.emit(Events.ChannelDeleted, channel);
  };

  /* cspell:words handlechannelupdated */
  handlechannelupdated = async (channel: ChannelUpdatedEvent) => {
    this.eventEmitter.emit(Events.ChannelUpdated, channel);
  };

  /* cspell:words handleuserchannelremoved */
  handleuserchannelremoved = async (msg: UserChannelRemovedEvent) => {
    this.eventEmitter.emit(Events.UserChannelRemoved, msg);
  };

  /* cspell:words handlegivecoffee */
  handlegivecoffee = async (data: TokenSentEvent) => {
    this.eventEmitter.emit(Events.TokenSend, data);
  };

  /* cspell:words handleaddclanuser */
  handleaddclanuser = async (data) => {
    this.eventEmitter.emit(Events.AddClanUser, data);
  };

  /* cspell:words handleroleassigned */
  handleroleassigned = async (msg) => {};

  /* cspell:words handlemessagebuttonclicked */
  handlemessagebuttonclicked = (data) => {
    this.eventEmitter.emit(Events.MessageButtonClicked, data);
  };

  handletokensend = (data: TokenSentEvent) => {
    if (data.sender_name === 'dulieu.vblc') return;
    this.eventEmitter.emit(Events.TokenSend, data);
  };

  /* cspell:words handlechannelmessage */
  handlechannelmessage = async (msg: ChannelMessage) => {
    if (msg.code) return; // ignored edited message
    ['attachments', 'mentions', 'references'].forEach((key) => {
      if (!Array.isArray(msg[key])) msg[key] = [];
    });
    if (msg.display_name === 'FUMO') return;
    this.eventEmitter.emit(Events.ChannelMessage, msg);
  };
}
