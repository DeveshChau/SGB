import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:3000'); // WebSocket server URL
  }

  public send(message: any) {
    this.socket$.next(message);
  }

  public onMessage() {
    return this.socket$;
  }
}
