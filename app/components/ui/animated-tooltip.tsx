'use client';
import React, { useCallback, useState } from 'react';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useRouter } from 'next/navigation';
import Edit from '@/app/assets/svg/Edit';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './animated-modal';
import TrashBin from '@/app/assets/svg/TrashBin';
import EyeIcon from '@/app/assets/svg/EyeIcon';
import { formatCurrencyVND, processString, sumTotalBill } from '@/lib/utils';
import { Checkbox } from '@nextui-org/react';

export const AnimatedTooltip = ({
  items,
  id,
  refetch,
  data,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    event: string;
  }[];
  id: string;
  refetch: () => void;
  data: any;
}) => {
  const router = useRouter();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  const redirectToDetail = useCallback(
    (id: string) => {
      router.push('/split-the-bill/' + id);
    },
    [router]
  );

  const [listTransferPerson, setListTransferPerson] = useState(
    data?.listTransferPerson || []
  );

  const changeChecked = (value: any, index: number) => {
    const updatedList = [...listTransferPerson];
    updatedList[index].checked = value;
    setListTransferPerson(updatedList);
  };

  const renderItem = (item: any) => {
    switch (item.event) {
      case 'edit':
        return (
          <div
            className='text-center'
            onClick={() => {
              redirectToDetail(id);
            }}
          >
            <Edit className='cursor-pointer hover:text-primary' />
          </div>
        );

      case 'delete':
        return (
          <Modal>
            <ModalTrigger>
              <div>
                <TrashBin className='h-5 w-5 cursor-pointer text-[#191a1f] hover:text-danger' />
              </div>
            </ModalTrigger>

            <ModalBody>
              <ModalContent>
                <div className='text-center text-lg'>
                  Bạn có chắc chắn muốn xóa hóa đơn này không?
                </div>
              </ModalContent>
              <ModalFooter className='gap-4' id={id} refetch={refetch} />
            </ModalBody>
          </Modal>
        );

      default:
        return (
          <Modal>
            <ModalTrigger>
              <div>
                <EyeIcon className='cursor-pointer hover:fill-blue-500' />
              </div>
            </ModalTrigger>

            <ModalBody>
              <ModalContent>
                <div className='flex flex-col gap-2'>
                  <div className='text-xl'>
                    Thông tin hóa đơn: {data.nameBill}
                  </div>
                  <div className='flex flex-col gap-1 text-base'>
                    <div>
                      Tổng số tiền giảm giá :{' '}
                      <span className='text-primary'>
                        {formatCurrencyVND(parseInt(data.amountDiscount) || 0)}
                      </span>
                    </div>
                    <div>
                      Phí Ship :{' '}
                      <span className='text-primary'>
                        {formatCurrencyVND(parseInt(data.shipping) || 0)}
                      </span>
                    </div>
                    <div>
                      Tổng số tiền sau khi thanh toán toàn bộ nhận được:{' '}
                      <span className='text-primary'>
                        {formatCurrencyVND(
                          Math.round(
                            parseInt(sumTotalBill(data.listTransferPerson))
                          ) || 0
                        )}
                      </span>
                    </div>
                    {listTransferPerson.length > 0 && (
                      <div className='mt-1 flex flex-col gap-1'>
                        <table>
                          <thead>
                            <tr className='h-10 bg-gray-100 text-left text-sm font-thin text-gray-400'>
                              <th className='text-center'>Đã thanh toán</th>
                              <th className=''>Mention</th>
                              <th className=''>Số tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listTransferPerson.map(
                              (item: any, index: number) => (
                                <tr key={index} className='h-10 border-b'>
                                  <td className='text-center'>
                                    <Checkbox
                                      isSelected={item.checked}
                                      aria-hidden={false}
                                      onValueChange={(e) => {
                                        changeChecked(e, index);
                                      }}
                                    ></Checkbox>
                                  </td>
                                  <td className='text-left'>
                                    <div>{processString(item.mention)}</div>
                                  </td>
                                  <td className='text-left'>
                                    <div className='text-primary'>
                                      {formatCurrencyVND(
                                        parseInt(item.moneyAfterReduction) || 0
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </ModalContent>
              <ModalFooter
                isDelete={false}
                className='gap-4'
                id={id}
                refetch={refetch}
                listTransferPerson={listTransferPerson}
              />
            </ModalBody>
          </Modal>
        );
    }
  };

  return (
    <>
      {items.map((item) => (
        <div
          className='group relative'
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode='popLayout'>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: 'nowrap',
                }}
                className='absolute -left-1/2 -top-16 z-50 flex translate-x-1/2  flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl'
              >
                <div className='absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent ' />
                <div className='absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent ' />
                <div className='relative z-30 text-base font-bold text-white'>
                  {item.name}
                </div>
                <div className='text-xs text-white'>{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {renderItem(item)}
        </div>
      ))}
    </>
  );
};
