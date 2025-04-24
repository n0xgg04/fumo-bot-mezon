import { Injectable } from '@nestjs/common';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { db } from 'src/db';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { MezonService } from 'src/mezon/mezon.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InferResult, sql } from 'kysely';

const ROOMS = [
  {
    roomId: 1,
    member: [
      {
        name: 'Hoàng Phương Nguyên',
        username: 'nguyen.hoangphuong',
      },
      {
        name: 'Đoàn Văn Vui',
        username: 'vui.doanvan',
      },
    ],
  },
  {
    roomId: 2,
    member: [
      {
        name: 'Phạm Minh Tuấn',
        username: 'tuan.phamminh',
      },
      {
        name: 'Nguyễn Hoàng Khánh Minh',
        username: 'minh.nguyenhoangkhanh',
      },
    ],
  },
  {
    roomId: 3,
    member: [
      {
        name: 'Nguyễn Tuấn Đạt',
        username: 'dat.nguyentuan',
      },
      {
        name: 'Nguyễn Văn Thiện',
        username: 'thien.nguyenvan',
      },
    ],
  },
  {
    roomId: 4,
    member: [
      {
        name: 'Lục Văn Minh',
        username: 'minh.lucvan',
      },
      {
        name: 'Lê Sỹ Trường Sơn',
        username: 'son.lesytruong',
      },
    ],
  },
  {
    roomId: 5,
    member: [
      {
        name: 'Nguyễn Đức Minh Trí',
        username: 'tri.nguyenducminh',
      },
      {
        name: 'Huỳnh Lê Duy',
        username: 'duy.huynhle',
      },
    ],
  },
  {
    roomId: 6,
    member: [
      {
        name: 'Nguyễn Thái Toàn',
        username: 'toan.nguyenthai',
      },
      {
        name: 'Trần Xuân Bách',
        username: 'bach.tranxuan',
      },
    ],
  },
  {
    roomId: 7,
    member: [
      {
        name: 'Nguyễn Đức Chính',
        username: 'chinh.nguyenduc',
      },
      {
        name: 'Nguyễn Phú Vinh',
        username: 'vinh.nguyenphu',
      },
    ],
  },
  {
    roomId: 8,
    member: [
      {
        name: 'Phan Văn Thanh',
        username: 'thanh.phanvan',
      },
      {
        name: 'Trần Hà Hữu Cường',
        username: 'cuong.tranhahuu',
      },
    ],
  },
  {
    roomId: 9,
    member: [
      {
        name: 'Nguyễn Thanh Toàn',
        username: 'toan.nguyenthanh',
      },
      {
        name: 'Cao Văn Nam',
        username: 'nam.caovan',
      },
    ],
  },
  {
    roomId: 10,
    member: [
      {
        name: 'Trương Văn Minh Hiếu',
        username: 'hieu.truongvanminh',
      },
      {
        name: 'Tô Mạnh Đức',
        username: 'duc.tomanh',
      },
    ],
  },
  {
    roomId: 11,
    member: [
      {
        name: 'Bùi Ngọc Quang',
        username: 'quang.buingoc',
      },
      {
        name: 'Trần Văn Tuyên',
        username: 'tuyen.tranvan',
      },
    ],
  },
  {
    roomId: 12,
    member: [
      {
        name: 'Phạm Tiến Ánh',
        username: 'anh.phamtien',
      },
      {
        name: 'Mai Xuân Duy',
        username: 'duy.maixuan',
      },
    ],
  },
  {
    roomId: 13,
    member: [
      {
        name: 'Nguyễn Văn Mạnh',
        username: 'manh.nguyenvan',
      },
      {
        name: 'Dương Văn Tình',
        username: 'tinh.duongvan',
      },
    ],
  },
  {
    roomId: 14,
    member: [
      {
        name: 'Tống Lê Thắng',
        username: 'thang.tongle',
      },
      {
        name: 'Đào Hồng Quân',
        username: 'quan.daohong',
      },
    ],
  },
  {
    roomId: 15,
    member: [
      {
        name: 'Hồ Hoài Sân',
        username: 'san.hohoai',
      },
      {
        name: 'Nguyễn Đăng Hoàng Anh',
        username: 'anh.nguyendanghoang',
      },
    ],
  },
  {
    roomId: 16,
    member: [
      {
        name: 'Lê Kim Phi',
        username: 'phi.lekim',
      },
      {
        name: 'Đỗ Huy Hoàng',
        username: 'hoang.dohuy',
      },
    ],
  },
  {
    roomId: 17,
    member: [
      {
        name: 'Lương Tuấn Anh',
        username: 'anh.luongtuan',
      },
      {
        name: 'Đoàn Mạnh Hoàng',
        username: 'hoang.doanmanh',
      },
    ],
  },
  {
    roomId: 18,
    member: [
      {
        name: 'Trần Phi Long',
        username: 'long.tranphi',
      },
      {
        name: 'Nguyễn Xuân Quân',
        username: 'quan.nguyenxuan',
      },
    ],
  },
  {
    roomId: 19,
    member: [
      {
        name: 'Trần Đức Dương',
        username: 'duong.tranduc',
      },
      {
        name: 'Mai Hồng Mận',
        username: 'man.maihong',
      },
    ],
  },
  {
    roomId: 20,
    member: [
      {
        name: 'Đoàn Hữu Nhân',
        username: 'nhan.doanhuu',
      },
      {
        name: 'Nguyễn Quốc Đạt',
        username: 'dat.nguyenquoc',
      },
    ],
  },
  {
    roomId: 21,
    member: [
      {
        name: 'Cường Phan Chí Dũng',
        username: 'dung.cuongphanchi',
      },
      {
        name: 'Lê Văn Quang',
        username: 'quang.levan',
      },
    ],
  },
  {
    roomId: 22,
    member: [
      {
        name: 'Nguyễn Lê Linh',
        username: 'linh.nguyenle',
      },
      {
        name: 'Đặng Quang Vinh',
        username: 'vinh.dangquang',
      },
    ],
  },
  {
    roomId: 23,
    member: [
      {
        name: 'Dương Lê Quang Huy',
        username: 'huy.duonglequang',
      },
      {
        name: 'Nguyễn Đình Hiếu',
        username: 'hieu.nguyendinh',
      },
    ],
  },
  {
    roomId: 24,
    member: [
      {
        name: 'Nguyễn Hoàng Duy',
        username: 'duy.nguyenhoang',
      },
      {
        name: 'Giang Trung Nghĩa',
        username: 'nghia.giangtrung',
      },
    ],
  },
  {
    roomId: 25,
    member: [
      {
        name: 'Hoàng Minh Quân',
        username: 'quan.hoangminh',
      },
      {
        name: 'Hà Quốc Đạt',
        username: 'dat.haquoc',
      },
    ],
  },
  {
    roomId: 26,
    member: [
      {
        name: 'Nguyễn Trọng Tuấn',
        username: 'tuan.nguyentrong',
      },
      {
        name: 'Củ Mạnh Tuấn Tài',
        username: 'tai.cumanhtuan',
      },
    ],
  },
  {
    roomId: 27,
    member: [
      {
        name: 'Nguyễn Sơn Tùng',
        username: 'tung.nguyenson',
      },
      {
        name: 'Huỳnh Phúc Điền',
        username: 'dien.huynhphuc',
      },
    ],
  },
  {
    roomId: 28,
    member: [
      {
        name: 'Nguyễn Văn Tiến',
        username: 'tien.nguyenvan',
      },
      {
        name: 'Hoàng Nguyễn Ngọc Duy Linh',
        username: 'linh.hoangnguyenngocduỵ',
      },
    ],
  },
  {
    roomId: 29,
    member: [
      {
        name: 'Trần Anh Tín',
        username: 'tin.trananh',
      },
      {
        name: 'Nguyễn Nam Dương',
        username: 'duong.nguyennam',
      },
    ],
  },
  {
    roomId: 30,
    member: [
      {
        name: 'Nguyễn Đại Dương',
        username: 'duong.nguyendai',
      },
      {
        name: 'Đặng An Thiên',
        username: 'thien.dangan',
      },
    ],
  },
  {
    roomId: 31,
    member: [
      {
        name: 'Đỗ Hoàng Hiếu',
        username: 'hieu.dohoang',
      },
      {
        name: 'Nguyễn Phước Nguyên',
        username: 'nguyen.nguyenphuoc',
      },
    ],
  },
  {
    roomId: 32,
    member: [
      {
        name: 'Nguyễn Viết Hoàng',
        username: 'hoang.nguyenviet',
      },
      {
        name: 'Nguyễn Ngọc Anh Tuấn',
        username: 'tuan.nguyenngocanh',
      },
    ],
  },
  {
    roomId: 33,
    member: [
      {
        name: 'Nguyễn Trần Nhân',
        username: 'nhan.nguyentran',
      },
      {
        name: 'Trịnh Duy Kiên',
        username: 'kien.trinhduy',
      },
    ],
  },
  {
    roomId: 34,
    member: [
      {
        name: 'Đào Hoàng Hữu',
        username: 'huu.daohoang',
      },
      {
        name: 'Phạm Chu Dương',
        username: 'duong.phamchu',
      },
    ],
  },
  {
    roomId: 35,
    member: [
      {
        name: 'Nguyễn Văn Tân',
        username: 'tan.nguyenvan',
      },
      {
        name: 'Đỗ Tuấn Anh',
        username: 'anh.dotuan',
      },
    ],
  },
  {
    roomId: 36,
    member: [
      {
        name: 'Đỗ Đức Trung',
        username: 'trung.doduc',
      },
      {
        name: 'Vương Hữu Trường',
        username: 'truong.vuonghuu',
      },
    ],
  },
  {
    roomId: 37,
    member: [
      {
        name: 'Huỳnh Phúc Lợi',
        username: 'loi.huynhphuc',
      },
      {
        name: 'Lê Đăng Quang',
        username: 'quang.ledang',
      },
    ],
  },
  {
    roomId: 38,
    member: [
      {
        name: 'Nguyễn Văn Thịnh',
        username: 'thinh.nguyenvan',
      },
      {
        name: 'Võ Đình Hoàng Long',
        username: 'long.vodinhhoang',
      },
    ],
  },
  {
    roomId: 39,
    member: [
      {
        name: 'Nguyễn Lê Anh Thuận',
        username: 'thuan.nguyenleanh',
      },
      {
        name: 'Nguyễn Tiến Anh',
        username: 'anh.nguyentien',
      },
    ],
  },
  {
    roomId: 40,
    member: [
      {
        name: 'Nguyễn Văn Nhân',
        username: 'nhan.nguyenvan',
      },
      {
        name: 'Lê Ngọc Thạch',
        username: 'thach.lengoc',
      },
    ],
  },
  {
    roomId: 41,
    member: [
      {
        name: 'Phạm Duy Niên',
        username: 'nien.phamduy',
      },
      {
        name: 'Trần Chí Minh',
        username: 'minh.tranchi',
      },
    ],
  },
  {
    roomId: 42,
    member: [
      {
        name: 'Nguyễn Quốc Vinh',
        username: 'vinh.nguyenquoc',
      },
      {
        name: 'Nguyễn Tuấn Anh',
        username: 'anh.nguyentuan',
      },
    ],
  },
  {
    roomId: 43,
    member: [
      {
        name: 'Bùi Hải Nam',
        username: 'nam.buihai',
      },
      {
        name: 'Trần Hữu Vinh',
        username: 'vinh.tranhuu',
      },
    ],
  },
  {
    roomId: 44,
    member: [
      {
        name: 'Nguyễn Sỹ Đạt',
        username: 'dat.nguyensy',
      },
      {
        name: 'Lê Đình Trâm',
        username: 'tram.ledinh',
      },
    ],
  },
  {
    roomId: 45,
    member: [
      {
        name: 'Đặng Quốc Việt',
        username: 'viet.dangquoc',
      },
      {
        name: 'Dương Văn Phúc',
        username: 'phuc.duongvan',
      },
    ],
  },
  {
    roomId: 46,
    member: [
      {
        name: 'Lê Xuân Huy',
        username: 'huy.lexuan',
      },
      {
        name: 'Trần Đình Quý',
        username: 'quy.trandinh',
      },
    ],
  },
  {
    roomId: 47,
    member: [
      {
        name: 'Phạm Văn Khánh',
        username: 'khanh.phamvan',
      },
      {
        name: 'Phan Vương Bảo',
        username: 'bao.phanvuong',
      },
    ],
  },
  {
    roomId: 48,
    member: [
      {
        name: 'Văn Nhật Duy',
        username: 'duy.vannhat',
      },
      {
        name: 'Ngô Mạnh Hùng',
        username: 'hung.ngomanh',
      },
    ],
  },
  {
    roomId: 49,
    member: [
      {
        name: 'Trần Trường Anh',
        username: 'anh.trantruong',
      },
      {
        name: 'Lê Tiến Anh',
        username: 'anh.letien',
      },
    ],
  },
  {
    roomId: 50,
    member: [
      {
        name: 'Hoàng Đình Trung',
        username: 'trung.hoangdinh',
      },
      {
        name: 'Trần Nam Huy',
        username: 'huy.trannam',
      },
    ],
  },
  {
    roomId: 51,
    member: [
      {
        name: 'Phạm Huyền Đức',
        username: 'duc.phamhuyen',
      },
      {
        name: 'Lê Tuấn Nghĩa',
        username: 'nghia.letuan',
      },
    ],
  },
  {
    roomId: 52,
    member: [
      {
        name: 'Đặng Hoàng Anh Quân',
        username: 'quan.danghoanganh',
      },
      {
        name: 'Trịnh Hoài Nam',
        username: 'nam.trinhhoai',
      },
    ],
  },
  {
    roomId: 53,
    member: [
      {
        name: 'Vũ Đức Bảo',
        username: 'bao.vuduc',
      },
      {
        name: 'Trần Văn Khánh',
        username: 'khanh.tranvan',
      },
    ],
  },
  {
    roomId: 54,
    member: [
      {
        name: 'Trần Trung Hiếu',
        username: 'hieu.trantrung',
      },
      {
        name: 'Đoàn Công Khanh',
        username: 'khanh.doancong',
      },
    ],
  },
  {
    roomId: 55,
    member: [
      {
        name: 'Nguyễn Sinh Hải',
        username: 'hai.nguyensinh',
      },
      {
        name: 'Bùi Hữu Dũng',
        username: 'dung.buihuu',
      },
    ],
  },
  {
    roomId: 56,
    member: [
      {
        name: 'Trịnh Đức Đại',
        username: 'dai.trinhduc',
      },
      {
        name: 'Ngô Đình Ngọc Quang',
        username: 'quang.ngodinhngoc',
      },
    ],
  },
  {
    roomId: 57,
    member: [
      {
        name: 'Đào Nhơn Tâm',
        username: 'tam.daonhon',
      },
      {
        name: 'Nguyễn Hữu Tuấn',
        username: 'tuan.nguyenhuu',
      },
    ],
  },
  {
    roomId: 58,
    member: [
      {
        name: 'Phan Huy Hoàng',
        username: 'hoang.phanhuy',
      },
      {
        name: 'Nguyễn Đình Hoàng',
        username: 'hoang.nguyendinh',
      },
    ],
  },
  {
    roomId: 59,
    member: [
      {
        name: 'Trương Ngọc Hưng',
        username: 'hung.truongngoc',
      },
      {
        name: 'Nguyễn Quang Huy',
        username: 'huy.nguyenquang',
      },
    ],
  },
  {
    roomId: 60,
    member: [
      {
        name: 'Vương Tấn Mạnh',
        username: 'manh.vuongtan',
      },
      {
        name: 'Phạm Trọng Thành',
        username: 'thanh.phamtrong',
      },
    ],
  },
  {
    roomId: 61,
    member: [
      {
        name: 'Nguyễn Trí Tuyên',
        username: 'tuyen.nguyentri',
      },
      {
        name: 'Trần Huy Tùng',
        username: 'tung.tranhuy',
      },
    ],
  },
  {
    roomId: 62,
    member: [
      {
        name: 'Đỗ Trọng Trung',
        username: 'trung.dotrong',
      },
      {
        name: 'Lê Trung Hiếu',
        username: 'hieu.letrung',
      },
    ],
  },
  {
    roomId: 63,
    member: [
      {
        name: 'Nguyễn Xuân Duy',
        username: 'duy.nguyenxuan',
      },
      {
        name: 'Trần Bình Dương',
        username: 'duong.tranbinh',
      },
    ],
  },
  {
    roomId: 64,
    member: [
      {
        name: 'Phạm Mạnh Tiến',
        username: 'tien.phammanh',
      },
      {
        name: 'Nguyễn Việt Kha',
        username: 'kha.nguyenviet',
      },
    ],
  },
  {
    roomId: 65,
    member: [
      {
        name: 'Nguyễn Hữu Tiến',
        username: 'tien.nguyenhuu',
      },
      {
        name: 'Nguyễn Nam Hiếu',
        username: 'hieu.nguyennam',
      },
    ],
  },
  {
    roomId: 66,
    member: [
      {
        name: 'Bùi Đoàn Quang Huy',
        username: 'huy.buidoanquang',
      },
      {
        name: 'Nguyễn Trường Sơn',
        username: 'son.nguyentruong',
      },
    ],
  },
  {
    roomId: 67,
    member: [
      {
        name: 'Cảnh Lê Chí Tâm',
        username: 'tam.canhlechi',
      },
      {
        name: 'Nguyễn Hữu Quân',
        username: 'quan.nguyenhuu',
      },
    ],
  },
  {
    roomId: 68,
    member: [
      {
        name: 'Tạ Khánh Vân',
        username: 'van.takhanh',
      },
      {
        name: 'Huỳnh Ngọc Vy',
        username: 'vy.huynhngoc',
      },
    ],
  },
  {
    roomId: 69,
    member: [
      {
        name: 'Lê Anh Thư',
        username: 'thu.leanh',
      },
      {
        name: 'Mai Thúy Ngọc',
        username: 'ngoc.maithuy',
      },
    ],
  },
  {
    roomId: 70,
    member: [
      {
        name: 'Nguyễn Thị Mai Trinh',
        username: 'trinh.nguyenthimai',
      },
      {
        name: 'Nguyễn Tâm Vy',
        username: 'vy.nguyentam',
      },
    ],
  },
  {
    roomId: 71,
    member: [
      {
        name: 'Nguyễn Thị Diễm',
        username: 'diem.nguyenthi',
      },
      {
        name: 'Nguyễn Hoàng Anh Thư',
        username: 'thu.nguyenhoanganh',
      },
    ],
  },
  {
    roomId: 72,
    member: [
      {
        name: 'Lê Thị Hải Yến',
        username: 'yen.lethihai',
      },
      {
        name: 'Phan Hồng Thảo',
        username: 'thao.phanhong',
      },
    ],
  },
  {
    roomId: 73,
    member: [
      {
        name: 'Phạm Thị Mai Vy',
        username: 'vy.phamthimai',
      },
      {
        name: 'Cao Thị Cẩm Tiên',
        username: 'tien.caothicam',
      },
    ],
  },
  {
    roomId: 74,
    member: [
      {
        name: 'Huỳnh Thị Ly',
        username: 'ly.huynhthi',
      },
      {
        name: 'Nguyễn Thanh Hiền',
        username: 'hien.nguyenthanh',
      },
    ],
  },
  {
    roomId: 75,
    member: [
      {
        name: 'Nguyễn Thị Ái Linh',
        username: 'linh.nguyenthiai',
      },
      {
        name: 'Nguyễn Thị Thanh Ngà',
        username: 'nga.nguyenthithanh',
      },
    ],
  },
  {
    roomId: 76,
    member: [
      {
        name: 'Trương Thị Phương Trinh',
        username: 'trinh.truongthiphuong',
      },
      {
        name: 'Nguyễn Trần Thy Ân',
        username: 'an.nguyentranthy',
      },
    ],
  },
  {
    roomId: 77,
    member: [
      {
        name: 'Ngô Thu Hiền',
        username: 'hien.ngothu',
      },
      {
        name: 'Nguyễn Thị Phương Anh',
        username: 'anh.nguyenthiphuong',
      },
    ],
  },
  {
    roomId: 78,
    member: [
      {
        name: 'Trần Minh Châu Giang',
        username: 'giang.tranminhchau',
      },
      {
        name: 'Trương Ngọc Cẩm Vy',
        username: 'vy.truongngoccam',
      },
    ],
  },
  {
    roomId: 79,
    member: [
      {
        name: 'Vũ Hoài Trang',
        username: 'trang.vuhoai',
      },
      {
        name: 'Nguyễn Thị Thảo Nguyên',
        username: 'nguyen.nguyenthithao',
      },
    ],
  },
  {
    roomId: 80,
    member: [
      {
        name: 'Nguyễn Thu Ngân',
        username: 'ngan.nguyenthu',
      },
      {
        name: 'Vũ Yến Ngọc',
        username: 'ngoc.vuyen',
      },
    ],
  },
  {
    roomId: 81,
    member: [
      {
        name: 'Lê Văn Kỳ Dư',
        username: 'du.levanky',
      },
      {
        name: 'Vũ Duy Xuân',
        username: 'xuan.vuduy',
      },
      {
        name: 'Lê Ngọc Trúc',
        username: 'truc.lengoc',
      },
    ],
  },
  {
    roomId: 82,
    member: [
      {
        name: 'Bùi Minh Thái',
        username: 'thai.buiminh',
      },
      {
        name: 'Đặng Văn Hoài Tú',
        username: 'tu.dangvanhoai',
      },
      {
        name: 'Nguyễn Công Toại',
        username: 'toai.nguyencong',
      },
    ],
  },
  {
    roomId: 83,
    member: [
      {
        name: 'Nguyễn Hoài Sơn',
        username: 'son.nguyenhoai',
      },
      {
        name: 'Trần Lê Huy Hoàng',
        username: 'hoang.tranlehuy',
      },
      {
        name: 'Vũ Văn Chức',
        username: 'chuc.vuvan',
      },
    ],
  },
  {
    roomId: 84,
    member: [
      {
        name: 'Võ Nhật Quang',
        username: 'quang.vonhat',
      },
      {
        name: 'Trần Ngọc Văn',
        username: 'van.tranngoc',
      },
      {
        name: 'Nguyễn Minh Đức',
        username: 'duc.nguyenminh',
      },
    ],
  },
  {
    roomId: 85,
    member: [
      {
        name: 'Đinh Như Thành',
        username: 'thanh.dinhnhu',
      },
      {
        name: 'Vũ Thanh Tuấn',
        username: 'tuan.vuthanh',
      },
      {
        name: 'Lê Ngọc Trường',
        username: 'truong.lengoc',
      },
    ],
  },
  {
    roomId: 86,
    member: [
      {
        name: 'Vũ Tài Linh',
        username: 'linh.vutai',
      },
      {
        name: 'Nguyễn Bá Thiết',
        username: 'thiet.nguyenba',
      },
      {
        name: 'Nguyễn Hải Đan',
        username: 'dan.nguyenhai',
      },
    ],
  },
  {
    roomId: 87,
    member: [
      {
        name: 'Nguyễn Duy Phong',
        username: 'phong.nguyenduy',
      },
      {
        name: 'Vũ Quang Chinh',
        username: 'chinh.vuquang',
      },
      {
        name: 'Nguyễn Anh Tuấn',
        username: 'tuan.nguyenanh',
      },
    ],
  },
  {
    roomId: 88,
    member: [
      {
        name: 'Nguyễn Hữu Minh Huy',
        username: 'huy.nguyenhuuminh',
      },
      {
        name: 'Nguyễn Gia Bảo',
        username: 'bao.nguyengia',
      },
      {
        name: 'Ngô Xuân Hiệp',
        username: 'hiep.ngoxuan',
      },
    ],
  },
  {
    roomId: 89,
    member: [
      {
        name: 'Nguyễn Thị Hà',
        username: 'ha.nguyenthi',
      },
      {
        name: 'Vũ Thị Vân',
        username: 'van.vuthi',
      },
      {
        name: 'Khuất Thị Trang',
        username: 'trang.khuatthi',
      },
    ],
  },
  {
    roomId: 90,
    member: [
      {
        name: 'Phan Ngọc Thanh Phương',
        username: 'phuong.phanngocthanh',
      },
      {
        name: 'Nguyễn Ngân Hà',
        username: 'ha.nguyenngan',
      },
      {
        name: 'Trần Thị Ánh Nhi',
        username: 'nhi.tranthianh',
      },
    ],
  },
  {
    roomId: 91,
    member: [
      {
        name: 'Đinh Thị Tuyết Ngân',
        username: 'ngan.dinhthituyet',
      },
      {
        name: 'Phan Lê Khôi Nguyên',
        username: 'nguyen.phanlekho',
      },
      {
        name: 'Đinh Thị Thu Hiền',
        username: 'hien.dinhthithu',
      },
    ],
  },
  {
    roomId: 92,
    member: [
      {
        name: 'Ngô Thục Anh',
        username: 'anh.ngothuc',
      },
      {
        name: 'Tôn Thúy Ngân',
        username: 'ngan.tonthuy',
      },
      {
        name: 'Trần Ngân Hà',
        username: 'ha.tranngan',
      },
    ],
  },
  {
    roomId: 93,
    member: [
      {
        name: 'Nguyễn Thu Hằng',
        username: 'hang.nguyenthu',
      },
      {
        name: 'Bùi Thị Diễm Hằng',
        username: 'hang.buithidiem',
      },
      {
        name: 'Nguyễn Thị Ngân Giang',
        username: 'giang.nguyenthingan',
      },
    ],
  },
];

@Injectable()
export class AvatarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  async handleAvatar(message: ChannelMessage) {
    const avatar = message.references?.[0].mesages_sender_avatar;
    const ref = getRef(message);
    await this.mezon.sendMessageToChannel({
      clan_id: message.clan_id!,
      channel_id: message.channel_id,
      is_public: message.is_public || false,
      mode: EMessageMode.CHANNEL_MESSAGE,
      attachments: [
        {
          filename: 'avatar.png',
          filetype: 'image/png',
          height: 200,
          size: 200,
          url: avatar,
          width: 200,
          channel_id: message.channel_id,
          mode: EMessageMode.CHANNEL_MESSAGE,
          channel_label: message.channel_label,
          message_id: message.message_id!,
          sender_id: message.sender_id,
        },
      ],
      msg: {
        t: '',
      },
      ref: [ref],
    });
  }

  async handleRoommate(data: ChannelMessage) {
    const placeholder = await this.fumoMessage.sendSystemMessage(
      data,
      'Đang tra cứu...',
      data,
    );

    const user = data.username;

    const m = `Roomate của bạn là:\n`;

    const room = ROOMS.find((r) => r.member.some((m) => m.username === user));

    let userList = ``;
    for (const member of room?.member || []) {
      if (member.username === user) continue;
      userList += `@${member.username} (${member.name})\n`;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const avatars = await this.prisma.message_logs.findMany({
      distinct: ['sender_id'],
      where: {
        sender_username: {
          in: room?.member.map((m) => m.username).filter((u) => u !== user),
        },
      },
    });

    if (!room) {
      await this.mezon.updateMessage(
        data.clan_id!,
        placeholder!.channel_id,
        data.mode || EMessageMode.CHANNEL_MESSAGE,
        data.is_public || false,
        placeholder!.message_id,
        {
          t: `Không tìm thấy thông tin.`,
        },
      );
    } else {
      await this.mezon.updateMessage(
        data.clan_id!,
        placeholder!.channel_id,
        data.mode || EMessageMode.CHANNEL_MESSAGE,
        data.is_public || false,
        placeholder!.message_id,
        {
          t: `${m}${userList}`,
        },
        [],
        avatars.map((a) => ({
          filename: 'avatar.png',
          filetype: 'image/png',
          height: 200,
          size: 200,
          url: a.sender_avatar,
          width: 200,
          channel_id: data.channel_id,
          mode: data.mode || EMessageMode.CHANNEL_MESSAGE,
          channel_label: data.channel_label,
          message_id: data.message_id!,
          sender_id: data.sender_id,
        })),
      );
    }
  }
}
