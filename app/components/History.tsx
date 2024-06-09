import {
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import React from 'react';
import Lottie from 'react-lottie';
import * as animationNoData from '@/app/assets/lotties/no-data.json';

export default function History() {
  const rows: Iterable<any> | undefined = [];

  const columns = [
    {
      key: 'name',
      label: 'Tên',
    },
    {
      key: 'date',
      label: 'Ngày tạo',
    },
    {
      key: 'action',
      label: '',
    },
  ];

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationNoData,
    rendererSettings: {
      // preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const EmptyContent = () => {
    return (
      <>
        <Lottie
          options={defaultOptions}
          height={400}
          width={400}
          isClickToPauseDisabled={true}
        />
      </>
    );
  };

  return (
    <Card>
      <CardBody className='w-full p-8'>
        <Table>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={rows} emptyContent={<EmptyContent />}>
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
