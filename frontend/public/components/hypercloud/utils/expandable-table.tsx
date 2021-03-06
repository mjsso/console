import * as React from 'react';
import { useState, useEffect } from 'react';
import * as _ from 'lodash-es';
import { Table as PfTable, TableHeader as PfTableHeader, TableBody as PfTableBody, ICell } from '@patternfly/react-table';

export const SingleExpandableTable: React.FC<SingleExpandableTableProps> = ({ header, itemList, rowRenderer, innerRenderer, compoundParent }) => {
  const [tableRows, setTableRows] = useState([]);
  useEffect(() => {
    const preData = [];
    itemList
      .reduce((result, item, index: number) => {
        return result.then(async () => {
          const innerTable = await innerRenderer(item);
          if (!!innerTable) {
            preData.push({
              isOpen: false,
              cells: rowRenderer(index, item, innerTable.props?.data?.length),
            });

            if (innerTable.props?.data?.length > 0) {
              let parentValue = index * 2;
              preData.push({
                parent: parentValue,
                compoundParent: compoundParent,
                cells: [
                  {
                    title: innerTable,
                    props: { colSpan: header.length, className: 'pf-m-no-padding' },
                  },
                ],
              });
            } else {
              let parentValue = index * 2;
              preData.push({
                parent: parentValue,
                compoundParent: compoundParent,
                cells: [
                  {
                    title: <div>...No Data...</div>,
                    props: { colSpan: header.length, className: 'pf-m-no-padding' },
                  },
                ],
              });
            }
          }
        });
      }, Promise.resolve())
      .then(() => {
        setTableRows(_.cloneDeep(preData));
      });
  }, [itemList]);

  // function delay() {
  //   return new Promise(resolve => setTimeout(resolve, 300));
  // }

  const onExpand = (event, rowIndex, colIndex, isOpen, rowData, extraData) => {
    let rows = _.cloneDeep(tableRows);
    if (!isOpen) {
      rows[rowIndex].cells.forEach((cell: ICell) => {
        if (cell.props) cell.props.isOpen = false;
      });
      (rows[rowIndex].cells[colIndex] as ICell).props.isOpen = true;
      rows[rowIndex].isOpen = true;
    } else {
      (rows[rowIndex].cells[colIndex] as ICell).props.isOpen = false;
      rows[rowIndex].isOpen = rows[rowIndex].cells.some((cell: ICell) => cell.props && cell.props.isOpen);
    }
    setTableRows(rows);
  };

  return (
    <PfTable aria-label="Compound expandable table" onExpand={onExpand} rows={tableRows} cells={header}>
      <PfTableHeader />
      <PfTableBody />
    </PfTable>
  );
};

type SingleExpandableTableProps = {
  itemList: any[]; // outer table??? itemList
  rowRenderer: (index, obj, itemCount: number) => any[]; // outer table??? row ????????? ????????? ???????????? ?????? ????????? return?????? renderer ??????
  innerRenderer: (parentItem) => any; // inner table??? render?????? ??????(ExpandableInnerTable ???????????? ???????????????)
  header: (ICell | string)[]; // header column?????? ??????. ?????? ????????? ????????? column object?????? cellTransforms: [compoundExpand] ?????? ???????????? ???.
  compoundParent: number; // table ?????? ??? ?????? column??? index
};
