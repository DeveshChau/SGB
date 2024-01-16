import { Component } from '@angular/core';
import { WebsocketService } from './websocket.service';

interface socketResponse {
  "tranche": string;
  "ISIN": string;
  "issueDate": string;
  "exchange": string;
  "symbol": string;
  "issuePrice": number;
  "interestRate": number;
  "cashFlow": number;
  "numberOfUnits": number;
  "period": number;
  "maturityDate": string;
  "askPrice": number;
  "calYield": number;
  "fairValue": number;
  "discountToFairValue": number;
  "goldPrice": number;
  "discountToGoldPrice": number;
  "remainingMaturity": number;
  "discountToGold": number;
}
interface MyObject {
  [key: string]: socketResponse;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  obj: MyObject = {}

  constructor(private websocketService: WebsocketService) {
    this.websocketService.onMessage().subscribe(
      {
        next: (message: MyObject) => {
          this.obj = message
          console.log(message);
          
        },
        error: (err) => console.error('WebSocket error:'),
        complete: () => console.log('WebSocket connection closed')
      });
  }
}
