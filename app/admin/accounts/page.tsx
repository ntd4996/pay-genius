'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@nextui-org/react';

interface Account {
  _id: string;
  name: string;
  accountNumber: string;
  codeBank: string;
  mention?: string;
  idMattermost?: string;
  createdAt: string;
  updateAt: string;
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    codeBank: '',
    mention: '',
    idMattermost: '',
  });

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/admin/accounts');
      setAccounts(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách tài khoản');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedAccount) {
        await axios.put(`/api/admin/accounts/${selectedAccount._id}`, formData);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await axios.post('/api/admin/accounts', formData);
        toast.success('Thêm tài khoản thành công');
      }
      onClose();
      fetchAccounts();
      setFormData({
        name: '',
        accountNumber: '',
        codeBank: '',
        mention: '',
        idMattermost: '',
      });
      setSelectedAccount(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      accountNumber: account.accountNumber,
      codeBank: account.codeBank,
      mention: account.mention || '',
      idMattermost: account.idMattermost || '',
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await axios.delete(`/api/admin/accounts/${id}`);
        toast.success('Xóa tài khoản thành công');
        fetchAccounts();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa tài khoản');
      }
    }
  };

  const handleRemindDebts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/accounts/remind');
      const { debtData, messageResults } = response.data;

      if (debtData.length === 0) {
        toast.info('Không có người dùng nào cần nhắc nợ');
      } else {
        toast.success(
          `Đã tìm thấy ${debtData.length} người dùng có hóa đơn chưa thanh toán`
        );
        console.log('Chi tiết nợ:', debtData);
        console.log('Kết quả gửi tin nhắn:', messageResults);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi kiểm tra nợ');
      console.error('Error checking debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Quản lý tài khoản</h1>
        <div className='flex gap-2'>
          <Button
            color='warning'
            onPress={handleRemindDebts}
            isLoading={isLoading}
          >
            Nhắc nợ
          </Button>
          <Button
            color='primary'
            onPress={() => {
              setSelectedAccount(null);
              setFormData({
                name: '',
                accountNumber: '',
                codeBank: '',
                mention: '',
                idMattermost: '',
              });
              onOpen();
            }}
          >
            Thêm tài khoản
          </Button>
        </div>
      </div>

      <Table aria-label='Danh sách tài khoản' className='mb-6'>
        <TableHeader>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>SỐ TÀI KHOẢN</TableColumn>
          <TableColumn>MÃ NGÂN HÀNG</TableColumn>
          <TableColumn>MENTION</TableColumn>
          <TableColumn>ID MATTERMOST</TableColumn>
          <TableColumn>NGÀY TẠO</TableColumn>
          <TableColumn>NGÀY CẬP NHẬT</TableColumn>
          <TableColumn>THAO TÁC</TableColumn>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account._id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.accountNumber}</TableCell>
              <TableCell>{account.codeBank}</TableCell>
              <TableCell>{account.mention || '-'}</TableCell>
              <TableCell>{account.idMattermost || '-'}</TableCell>
              <TableCell>
                {new Date(account.createdAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                {new Date(account.updateAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    color='primary'
                    variant='light'
                    size='sm'
                    onPress={() => handleEdit(account)}
                  >
                    Sửa
                  </Button>
                  <Button
                    color='danger'
                    variant='light'
                    size='sm'
                    onPress={() => handleDelete(account._id)}
                  >
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {selectedAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'}
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <Input
                label='Tên'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label='Số tài khoản'
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
              <Input
                label='Mã ngân hàng'
                value={formData.codeBank}
                onChange={(e) =>
                  setFormData({ ...formData, codeBank: e.target.value })
                }
              />
              <Input
                label='Mention'
                value={formData.mention}
                onChange={(e) =>
                  setFormData({ ...formData, mention: e.target.value })
                }
                placeholder='@username'
              />
              <Input
                label='ID Mattermost (không bắt buộc)'
                value={formData.idMattermost}
                onChange={(e) =>
                  setFormData({ ...formData, idMattermost: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onClose}>
              Hủy
            </Button>
            <Button color='primary' onPress={handleSubmit}>
              {selectedAccount ? 'Cập nhật' : 'Thêm'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
