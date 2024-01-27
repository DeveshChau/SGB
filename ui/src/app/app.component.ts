import { Component } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { ColDef } from 'ag-grid-community'; // Column Definitions Interface

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  defColDef = {
    flex: 1
  }
  colDefs: ColDef[] = [
		{field: "tranche"},
		{field: "ISIN"},
		{field: "askPrice", unSortIcon: true},
		{field: "issueDate"},
		{field: "exchange"},
		{field: "symbol"},
		{field: "issuePrice"},
		{field: "interestRate"},
		{field: "cashFlow"},
		{field: "numberOfUnits"},
		{field: "period"},
		{field: "maturityDate"},
		{field: "calYield"},
		{field: "fairValue"},
		{field: "discountToFairValue"},
		{field: "goldPrice"},
		{field: "discountToGoldPrice"},
		{field: "remainingMaturity"}
  ];
  rowData: any = [3];
  constructor(private websocketService: WebsocketService) {
    
  }
  ngOnInit() {
    if (this.rowData.length > 0) {
      this.websocketService.onMessage().subscribe(
        {
          next: (message) => {
            this.rowData = message
          },
          error: (err) => console.error('WebSocket error:'),
          complete: () => console.log('WebSocket connection closed')
        });
    }
  }
}
