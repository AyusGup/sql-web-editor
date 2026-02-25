export interface IColumn {
  columnName: string;
  dataType: string;
}

export interface ISampleTable {
  tableName: string;
  columns: IColumn[];
  rows: Record<string, any>[];
}

export interface IExpectedOutput {
  type: "table" | "single_value" | "column" | "count";
  value: any;
}