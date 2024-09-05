'use client';
import axios from '@/app/libs/axios';
import { cn } from '@/lib/utils';
import { Button } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  Fragment,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';

interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export function Modal({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

export const ModalTrigger = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { setOpen } = useModal();
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-md text-center text-black dark:text-white',
        className
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
};

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { open } = useModal();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  const modalRef = useRef(null);
  const { setOpen } = useModal();
  useOutsideClick(modalRef, () => setOpen(false));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            backdropFilter: 'blur(10px)',
          }}
          exit={{
            opacity: 0,
            backdropFilter: 'blur(0px)',
          }}
          className='fixed inset-0 z-50 flex h-full w-full  items-center justify-center [perspective:800px] [transform-style:preserve-3d]'
        >
          <Overlay />

          <motion.div
            ref={modalRef}
            className={cn(
              'relative z-50 flex h-fit flex-1 flex-col overflow-hidden border border-transparent bg-white dark:border-neutral-800 dark:bg-neutral-950 md:max-w-fit md:rounded-2xl',
              className
            )}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 15,
            }}
          >
            <CloseIcon />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({
  children,
  className,
  isDelete = true,
}: {
  children: ReactNode;
  className?: string;
  isDelete?: boolean;
}) => {
  return (
    <div className={cn('flex flex-1 flex-col p-8 md:p-10', className)}>
      {children}
    </div>
  );
};

export const ModalFooter = ({
  children,
  className,
  classNameClose,
  id,
  refetch,
  isDelete = true,
  listTransferPerson,
}: {
  children?: ReactNode;
  className?: string;
  classNameClose?: string;
  id?: string | string[];
  refetch?: () => void;
  isDelete?: boolean;
  listTransferPerson?: any[];
}) => {
  const { setOpen } = useModal();
  const path = usePathname();
  const router = useRouter();

  const deleteBill = async () => {
    if (id) {
      await deleteBillMutation(id);
    }
    setOpen(false);
  };

  const { mutate: deleteBillMutation, isPending: isLoadingDelete } =
    useMutation({
      mutationFn: async (id: string | string[]) => {
        const response = await axios.delete(`/api/bill/${id}`);
        return response.data;
      },
      onSuccess: () => {
        if (path === `/split-the-bill/${id}`) {
          router.push('/split-the-bill');
        } else if (refetch) {
          refetch();
        }
        toast.success('Xóa hóa đơn thành công');
      },
      onError: (e) => {
        toast.error('Có lỗi xảy ra');
      },
    });

  const handleUpdateBill = async () => {
    const body = {
      listTransferPerson,
      status: 'unSuccess',
    };
    const isSuccess = listTransferPerson?.every(
      (person: any) => person.checked
    );
    if (!isSuccess) {
      body.status = 'unSuccess';
    } else {
      body.status = 'success';
    }
    await updateBill(body);
  };

  const { mutate: updateBill, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/bill/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đã cập nhật hóa đơn thành công');
      if (refetch) {
        refetch();
      }
      setOpen(false);
    },
    onError: (e) => {
      toast.error('Có lỗi xảy ra');
    },
  });

  return (
    <div
      className={cn(
        'flex justify-end bg-gray-100 p-4 dark:bg-neutral-900',
        className
      )}
    >
      {isDelete ? (
        <Fragment>
          <Button
            aria-hidden={false}
            className={cn(classNameClose)}
            onClick={() => {
              setOpen(false);
            }}
            isLoading={isLoadingDelete}
          >
            Close
          </Button>

          <Button
            aria-hidden={false}
            className={cn(classNameClose)}
            onClick={() => {
              deleteBill();
            }}
            color='danger'
            isLoading={isLoadingDelete}
          >
            Xóa hóa đơn
          </Button>
        </Fragment>
      ) : (
        <Fragment>
          <Button
            aria-hidden={false}
            className={cn(classNameClose)}
            onClick={() => {
              setOpen(false);
            }}
            isLoading={isLoadingUpdate}
          >
            Close
          </Button>

          <Button
            aria-hidden={false}
            className={cn(classNameClose)}
            onClick={() => {
              handleUpdateBill();
            }}
            color='primary'
            isLoading={isLoadingUpdate}
          >
            Lưu
          </Button>
        </Fragment>
      )}

      {children}
    </div>
  );
};

const Overlay = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        backdropFilter: 'blur(10px)',
      }}
      exit={{
        opacity: 0,
        backdropFilter: 'blur(0px)',
      }}
      className={`fixed inset-0 z-50 h-full w-full bg-black bg-opacity-50 ${className}`}
    ></motion.div>
  );
};

const CloseIcon = () => {
  const { setOpen } = useModal();
  return (
    <button
      onClick={() => setOpen(false)}
      className='group absolute right-4 top-4'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-4 w-4 text-black transition duration-200 group-hover:rotate-3 group-hover:scale-125 dark:text-white'
      >
        <path stroke='none' d='M0 0h24v24H0z' fill='none' />
        <path d='M18 6l-12 12' />
        <path d='M6 6l12 12' />
      </svg>
    </button>
  );
};

// Hook to detect clicks outside of a component.
// Add it in a separate file, I've added here for simplicity
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: any) => {
      // DO NOTHING if the element being clicked is the target element or their children
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, callback]);
};
