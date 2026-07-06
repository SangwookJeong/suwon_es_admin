import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'
import mock from '@/@fake-db/mock'

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8]
const av = i => avatars[i % avatars.length]

// serviceHistory: 연도별 봉사현황 [{ year, department, position, assignedClass }]
const users = [
  // ── 교무팀 (4명) ──
  { id: 1, fullName: '이승진', department: '교무팀', position: '부장', assignedClass: '', extraRole: '', contact: '010-3434-5748', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '99.01.01', avatar: av(0), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '반장', assignedClass: '' }, { year: 2025, department: '교무팀', position: '교무보조', assignedClass: '' }, { year: 2026, department: '교무팀', position: '부장', assignedClass: '' }] },
  { id: 2, fullName: '이희봉', department: '교무팀', position: '교무', assignedClass: '', extraRole: '', contact: '010-9228-7101', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '06.07.30', avatar: av(1), status: '현직', serviceHistory: [{ year: 2025, department: '교무팀', position: '교무', assignedClass: '' }, { year: 2026, department: '교무팀', position: '교무', assignedClass: '' }] },
  { id: 3, fullName: '박진영', department: '교무팀', position: '회계', assignedClass: '', extraRole: '', contact: '010-6671-7975', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '90.08.03', avatar: av(2), status: '현직', serviceHistory: [{ year: 2024, department: '초등1반', position: '자매부반장', assignedClass: '' }, { year: 2025, department: '교무팀', position: '회계', assignedClass: '' }, { year: 2026, department: '교무팀', position: '회계', assignedClass: '' }] },
  { id: 4, fullName: '한권탁', department: '교무팀', position: '교무보조', assignedClass: '', extraRole: '', contact: '010-8987-1390', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '09.08.01', avatar: av(3), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '5-3반' }, { year: 2026, department: '교무팀', position: '교무보조', assignedClass: '' }] },

  // ── 상담팀 (5명) ──
  { id: 5, fullName: '김강영', department: '상담팀', position: '상담팀장', assignedClass: '', extraRole: '', contact: '010-2792-5970', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '96.04.06', avatar: av(4), status: '현직', serviceHistory: [{ year: 2024, department: '상담팀', position: '상담인', assignedClass: '' }, { year: 2025, department: '상담팀', position: '상담팀장', assignedClass: '' }, { year: 2026, department: '상담팀', position: '상담팀장', assignedClass: '' }] },
  { id: 6, fullName: '이경호', department: '상담팀', position: '상담인', assignedClass: '', extraRole: '', contact: '010-3315-0610', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '00.02.13', avatar: av(5), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '2-1반' }, { year: 2026, department: '상담팀', position: '상담인', assignedClass: '' }] },
  { id: 7, fullName: '정상욱', department: '상담팀', position: '상담인', assignedClass: '', extraRole: '', contact: '010-6332-9179', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '', avatar: av(6), status: '현직', serviceHistory: [{ year: 2025, department: '상담팀', position: '상담인', assignedClass: '' }, { year: 2026, department: '상담팀', position: '상담인', assignedClass: '' }] },
  { id: 8, fullName: '한창석', department: '상담팀', position: '상담인', assignedClass: '', extraRole: '', contact: '010-3932-0289', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '', avatar: av(7), status: '현직', serviceHistory: [{ year: 2026, department: '상담팀', position: '상담인', assignedClass: '' }] },
  { id: 9, fullName: '전상미', department: '상담팀', position: '상담지원', assignedClass: '', extraRole: '', contact: '010-9523-6080', serviceGroup: '어머니회', bs: 'S', occupation: '주부', salvationBirthday: '06.12.17', avatar: av(0), status: '현직', serviceHistory: [{ year: 2024, department: '초등3반', position: '분반교사', assignedClass: '6-2반' }, { year: 2025, department: '상담팀', position: '상담지원', assignedClass: '' }, { year: 2026, department: '상담팀', position: '상담지원', assignedClass: '' }] },

  // ── 초등1반 (15명) ──
  { id: 10, fullName: '박성은', department: '초등1반', position: '반장', assignedClass: '', extraRole: '', contact: '010-7443-2472', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '10.07.10', avatar: av(1), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '형제부반장', assignedClass: '' }, { year: 2025, department: '초등1반', position: '형제부반장', assignedClass: '' }, { year: 2026, department: '초등1반', position: '반장', assignedClass: '' }] },
  { id: 11, fullName: '신승윤', department: '초등1반', position: '형제부반장', assignedClass: '특수 (남)', extraRole: '', contact: '010-6436-3569', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '08.03.08', avatar: av(2), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '1-3반' }, { year: 2026, department: '초등1반', position: '형제부반장', assignedClass: '특수 (남)' }] },
  { id: 12, fullName: '김연화', department: '초등1반', position: '자매부반장', assignedClass: '', extraRole: '', contact: '010-5580-8025', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '95.11.18', avatar: av(3), status: '현직', serviceHistory: [{ year: 2024, department: '초등1반', position: '분반교사', assignedClass: '1-2반' }, { year: 2025, department: '초등1반', position: '분반교사', assignedClass: '2-1반' }, { year: 2026, department: '초등1반', position: '자매부반장', assignedClass: '' }] },
  { id: 13, fullName: '남귀중', department: '초등1반', position: '분반교사', assignedClass: '1-1반', extraRole: '방송/청년', contact: '010-3993-6429', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '09.10.00', avatar: av(4), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '3-2반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-1반' }] },
  { id: 14, fullName: '이영란', department: '초등1반', position: '분반교사', assignedClass: '1-2반', extraRole: '', contact: '010-6605-1070', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '00.01.21', avatar: av(5), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '1-4반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-2반' }] },
  { id: 15, fullName: '김재민', department: '초등1반', position: '분반교사', assignedClass: '1-3반', extraRole: '', contact: '010-2027-1198', serviceGroup: '청년회', bs: 'B', occupation: '대학생', salvationBirthday: '10.08.01', avatar: av(6), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-3반' }] },
  { id: 16, fullName: '김지영', department: '초등1반', position: '분반교사', assignedClass: '1-4반', extraRole: '', contact: '010-4645-9618', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '16.05.00', avatar: av(7), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '5-1반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-4반' }] },
  { id: 17, fullName: '김종혁', department: '초등1반', position: '분반교사', assignedClass: '1-5반', extraRole: '', contact: '010-8918-4056', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '', avatar: av(0), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-5반' }] },
  { id: 18, fullName: '이은주', department: '초등1반', position: '분반교사', assignedClass: '1-6반', extraRole: '', contact: '010-5122-6086', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(1), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '1-6반' }] },
  { id: 19, fullName: '한지수', department: '초등1반', position: '분반교사', assignedClass: '2-1반', extraRole: '손유희팀장', contact: '010-9965-2506', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '02.08.03', avatar: av(2), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '분반교사', assignedClass: '4-1반' }, { year: 2025, department: '초등1반', position: '분반교사', assignedClass: '2-3반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-1반' }] },
  { id: 20, fullName: '김이슬', department: '초등1반', position: '분반교사', assignedClass: '2-2반', extraRole: '피아노', contact: '010-9392-0430', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(3), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '2-2반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-2반' }] },
  { id: 21, fullName: '조서영', department: '초등1반', position: '분반교사', assignedClass: '2-3반', extraRole: '', contact: '010-9980-0149', serviceGroup: '청년회', bs: 'S', occupation: '대학생', salvationBirthday: '15.08.02', avatar: av(4), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-3반' }] },
  { id: 22, fullName: '정지혜', department: '초등1반', position: '분반교사', assignedClass: '2-4반', extraRole: '피아노', contact: '010-8454-4200', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '99.08.14', avatar: av(5), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '3-4반' }, { year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-4반' }] },
  { id: 23, fullName: '이하은', department: '초등1반', position: '분반교사', assignedClass: '2-5반', extraRole: '', contact: '010-9502-9104', serviceGroup: '청년회', bs: 'S', occupation: '대학생', salvationBirthday: '10.08.00', avatar: av(6), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-5반' }] },
  { id: 24, fullName: '박채린', department: '초등1반', position: '분반교사', assignedClass: '2-6반', extraRole: '', contact: '010-4211-4575', serviceGroup: '청년회', bs: 'S', occupation: '대학생', salvationBirthday: '', avatar: av(7), status: '현직', serviceHistory: [{ year: 2026, department: '초등1반', position: '분반교사', assignedClass: '2-6반' }] },

  // ── 초등2반 (14명) ──
  { id: 25, fullName: '장보승', department: '초등2반', position: '반장', assignedClass: '', extraRole: '', contact: '010-6252-7952', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '12.05.06', avatar: av(0), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '형제부반장', assignedClass: '' }, { year: 2025, department: '초등2반', position: '반장', assignedClass: '' }, { year: 2026, department: '초등2반', position: '반장', assignedClass: '' }] },
  { id: 26, fullName: '박재강', department: '초등2반', position: '형제부반장', assignedClass: '특수 (남)', extraRole: '찬율팀장', contact: '010-3708-5090', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '99.12.30', avatar: av(1), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-2반' }, { year: 2026, department: '초등2반', position: '형제부반장', assignedClass: '특수 (남)' }] },
  { id: 27, fullName: '허유정', department: '초등2반', position: '자매부반장', assignedClass: '3-2반', extraRole: '', contact: '010-9267-5332', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '12.03.29', avatar: av(2), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '3-5반' }, { year: 2026, department: '초등2반', position: '자매부반장', assignedClass: '3-2반' }] },
  { id: 28, fullName: '박현진', department: '초등2반', position: '분반교사', assignedClass: '3-1반', extraRole: '', contact: '010-9336-5387', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '14.01.05', avatar: av(3), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '6-1반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '3-1반' }] },
  { id: 29, fullName: '황인숙', department: '초등2반', position: '분반교사', assignedClass: '3-3반', extraRole: '', contact: '010-6207-0698', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '97.11.30', avatar: av(4), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '분반교사', assignedClass: '3-1반' }, { year: 2025, department: '초등2반', position: '분반교사', assignedClass: '3-3반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '3-3반' }] },
  { id: 30, fullName: '박도현', department: '초등2반', position: '분반교사', assignedClass: '3-4반', extraRole: '', contact: '010-7335-3428', serviceGroup: '청년회', bs: 'B', occupation: '', salvationBirthday: '', avatar: av(5), status: '현직', serviceHistory: [{ year: 2026, department: '초등2반', position: '분반교사', assignedClass: '3-4반' }] },
  { id: 31, fullName: '신민서', department: '초등2반', position: '분반교사', assignedClass: '3-5반', extraRole: '', contact: '010-4077-7458', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '10.02.10', avatar: av(6), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '1-6반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '3-5반' }] },
  { id: 32, fullName: '유한철', department: '초등2반', position: '분반교사', assignedClass: '4-1반', extraRole: '암송팀장', contact: '010-2710-1950', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '', avatar: av(7), status: '현직', serviceHistory: [{ year: 2024, department: '초등3반', position: '분반교사', assignedClass: '6-1반' }, { year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-1반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-1반' }] },
  { id: 33, fullName: '손새라', department: '초등2반', position: '분반교사', assignedClass: '4-2반', extraRole: '', contact: '010-9175-1954', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(0), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-3반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-2반' }] },
  { id: 34, fullName: '이슬이', department: '초등2반', position: '분반교사', assignedClass: '4-3반', extraRole: '', contact: '010-7791-0513', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '99.01.19', avatar: av(1), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-5반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-3반' }] },
  { id: 35, fullName: '정여민', department: '초등2반', position: '분반교사', assignedClass: '4-4반', extraRole: '', contact: '010-2637-0057', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(2), status: '현직', serviceHistory: [{ year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-4반' }] },
  { id: 36, fullName: '박현슬', department: '초등2반', position: '보조교사', assignedClass: '4-4반', extraRole: '피아노', contact: '010-8963-7975', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(3), status: '현직', serviceHistory: [{ year: 2026, department: '초등2반', position: '보조교사', assignedClass: '4-4반' }] },
  { id: 37, fullName: '정은비', department: '초등2반', position: '분반교사', assignedClass: '4-5반', extraRole: '', contact: '010-9181-9451', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(4), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '5-5반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-5반' }] },
  { id: 38, fullName: '김은혜', department: '초등2반', position: '분반교사', assignedClass: '4-6반', extraRole: '피아노', contact: '010-3307-3060', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '07.01.11', avatar: av(5), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-6반' }, { year: 2026, department: '초등2반', position: '분반교사', assignedClass: '4-6반' }] },

  // ── 초등3반 (15명) ──
  { id: 39, fullName: '오기훈', department: '초등3반', position: '반장', assignedClass: '', extraRole: '', contact: '010-2075-1302', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '90.07.29', avatar: av(6), status: '현직', serviceHistory: [{ year: 2024, department: '초등3반', position: '형제부반장', assignedClass: '' }, { year: 2025, department: '초등3반', position: '반장', assignedClass: '' }, { year: 2026, department: '초등3반', position: '반장', assignedClass: '' }] },
  { id: 40, fullName: '정성한', department: '초등3반', position: '형제부반장', assignedClass: '5-1반', extraRole: '', contact: '010-3122-9434', serviceGroup: '봉사회', bs: 'B', occupation: '직장인', salvationBirthday: '91.03.01', avatar: av(7), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '5-2반' }, { year: 2026, department: '초등3반', position: '형제부반장', assignedClass: '5-1반' }] },
  { id: 41, fullName: '김효숙', department: '초등3반', position: '자매부반장', assignedClass: '6-5반', extraRole: '', contact: '010-8531-6966', serviceGroup: '어머니회', bs: 'S', occupation: '주부', salvationBirthday: '94.11.18', avatar: av(0), status: '현직', serviceHistory: [{ year: 2024, department: '초등3반', position: '분반교사', assignedClass: '6-3반' }, { year: 2025, department: '초등3반', position: '분반교사', assignedClass: '6-5반' }, { year: 2026, department: '초등3반', position: '자매부반장', assignedClass: '6-5반' }] },
  { id: 42, fullName: '박효경', department: '초등3반', position: '분반교사', assignedClass: '5-2반', extraRole: '', contact: '010-6851-7070', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(1), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '분반교사', assignedClass: '5-2반' }] },
  { id: 43, fullName: '유인지', department: '초등3반', position: '분반교사', assignedClass: '5-3반', extraRole: '피아노', contact: '010-8454-8451', serviceGroup: '어머니회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(2), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '5-3반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '5-3반' }] },
  { id: 44, fullName: '이시연', department: '초등3반', position: '분반교사', assignedClass: '5-4반', extraRole: '', contact: '010-4413-9978', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(3), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '분반교사', assignedClass: '5-4반' }] },
  { id: 45, fullName: '안혜송', department: '초등3반', position: '분반교사', assignedClass: '5-5반', extraRole: '피아노', contact: '010-6816-9182', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(4), status: '현직', serviceHistory: [{ year: 2025, department: '초등1반', position: '분반교사', assignedClass: '2-5반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '5-5반' }] },
  { id: 46, fullName: '조현서', department: '초등3반', position: '분반교사', assignedClass: '5-6반', extraRole: '', contact: '010-2389-0801', serviceGroup: '청년회', bs: 'B', occupation: '대학생', salvationBirthday: '', avatar: av(5), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '분반교사', assignedClass: '5-6반' }] },
  { id: 47, fullName: '최명근', department: '초등3반', position: '분반교사', assignedClass: '6-1반', extraRole: '피아노', contact: '010-2876-0906', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '95.08.14', avatar: av(6), status: '현직', serviceHistory: [{ year: 2024, department: '초등2반', position: '분반교사', assignedClass: '4-2반' }, { year: 2025, department: '초등3반', position: '분반교사', assignedClass: '6-1반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-1반' }] },
  { id: 48, fullName: '김성혁', department: '초등3반', position: '분반교사', assignedClass: '6-2반', extraRole: '피아노', contact: '010-9179-9076', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '', avatar: av(7), status: '현직', serviceHistory: [{ year: 2025, department: '초등3반', position: '분반교사', assignedClass: '6-3반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-2반' }] },
  { id: 49, fullName: '박용원', department: '초등3반', position: '분반교사', assignedClass: '6-3반', extraRole: '', contact: '010-4011-5991', serviceGroup: '청년회', bs: 'B', occupation: '직장인', salvationBirthday: '15.06.01', avatar: av(0), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-3반' }] },
  { id: 50, fullName: '이성심', department: '초등3반', position: '분반교사', assignedClass: '6-4반', extraRole: '', contact: '010-2073-1302', serviceGroup: '어머니회', bs: 'S', occupation: '주부', salvationBirthday: '98.04.18', avatar: av(1), status: '현직', serviceHistory: [{ year: 2024, department: '초등3반', position: '분반교사', assignedClass: '6-4반' }, { year: 2025, department: '초등3반', position: '분반교사', assignedClass: '6-4반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-4반' }] },
  { id: 51, fullName: '최유주', department: '초등3반', position: '분반교사', assignedClass: '6-6반', extraRole: '피아노', contact: '010-2033-1174', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(2), status: '현직', serviceHistory: [{ year: 2025, department: '초등2반', position: '분반교사', assignedClass: '4-4반' }, { year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-6반' }] },
  { id: 52, fullName: '박유빈', department: '초등3반', position: '분반교사', assignedClass: '6-7반', extraRole: '', contact: '010-2654-9335', serviceGroup: '청년회', bs: 'S', occupation: '직장인', salvationBirthday: '', avatar: av(3), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '분반교사', assignedClass: '6-7반' }] },
  { id: 53, fullName: '김유민', department: '초등3반', position: '보조교사', assignedClass: '6-7반', extraRole: '', contact: '010-8788-2104', serviceGroup: '청년회', bs: 'S', occupation: '', salvationBirthday: '', avatar: av(4), status: '현직', serviceHistory: [{ year: 2026, department: '초등3반', position: '보조교사', assignedClass: '6-7반' }] },
]


// 👉 교사 목록 반환
mock.onGet('/apps/users/list').reply(config => {
  const {
    q = '',
    department = null,
    serviceGroup = null,
    occupation = null,
    status = null,
    perPage = 10,
    currentPage = 1,
  } = config.params ?? {}

  const queryLower = q.toLowerCase()

  let filteredUsers = users.filter(user =>
    (user.fullName.toLowerCase().includes(queryLower) || user.contact.includes(queryLower))
    && user.department === (department || user.department)
    && user.serviceGroup === (serviceGroup || user.serviceGroup)
    && (occupation ? user.occupation === occupation : true)
    && (status ? user.status === status : true),
  )

  const totalPage = Math.ceil(filteredUsers.length / perPage) || 1
  const totalUsers = filteredUsers.length

  if (perPage) {
    const firstIndex = (currentPage - 1) * perPage
    const lastIndex = perPage * currentPage

    filteredUsers = filteredUsers.slice(firstIndex, lastIndex)
  }

  return [200, { users: filteredUsers, totalPage, totalUsers }]
})

// 👉 교사 통계
mock.onGet('/apps/users/stats').reply(() => {
  const attendanceRates = [95, 92, 88, 100, 97, 85, 78, 93, 90, 82, 96, 91, 87, 94, 76, 89, 98, 83, 79, 86, 99, 84, 77, 91, 93, 88, 95, 81, 73, 90, 86, 97, 80, 75, 92, 88, 71, 85, 94, 89, 96, 82, 91, 74, 87, 93, 98, 76, 83, 90, 95, 72, 88]

  const statusCounts = {}
  const deptCounts = {}

  users.forEach(u => {
    statusCounts[u.status] = (statusCounts[u.status] || 0) + 1
    deptCounts[u.department] = (deptCounts[u.department] || 0) + 1
  })

  const attendanceList = users
    .filter(u => u.status === '현직')
    .map((u, i) => ({
      id: u.id,
      fullName: u.fullName,
      department: u.department,
      avatar: u.avatar,
      attendanceRate: attendanceRates[i % attendanceRates.length],
    }))
    .sort((a, b) => b.attendanceRate - a.attendanceRate)

  return [200, {
    total: users.length,
    statusCounts,
    deptCounts,
    top10: attendanceList.slice(0, 10),
    bottom10: attendanceList.slice(-10).reverse(),
  }]
})

// 👉 교사 추가
mock.onPost('/apps/users/user').reply(config => {
  const { user } = JSON.parse(config.data)
  const { length } = users
  let lastIndex = 0
  if (length)
    lastIndex = users[length - 1].id
  user.id = lastIndex + 1
  users.push(user)

  return [201, { user }]
})

// 👉 교사 상세 조회
mock.onGet(/\/apps\/users\/\d+/).reply(config => {
  const userId = config.url?.substring(config.url.lastIndexOf('/') + 1)
  const Id = Number(userId)
  const userIndex = users.findIndex(e => e.id === Id)
  const user = users[userIndex]

  if (user)
    return [200, user]

  return [404]
})

// 👉 교사 수정
mock.onPut(/\/apps\/users\/\d+/).reply(config => {
  const userId = config.url?.substring(config.url.lastIndexOf('/') + 1)
  const Id = Number(userId)
  const userIndex = users.findIndex(e => e.id === Id)

  if (userIndex !== -1) {
    const updatedData = JSON.parse(config.data)

    users[userIndex] = { ...users[userIndex], ...updatedData }

    return [200, users[userIndex]]
  }

  return [404]
})

// 👉 출결 데이터 (메모리 저장)
const attendanceRecords = {}

mock.onGet('/apps/attendance').reply(config => {
  const { date, type } = config.params ?? {}
  const key = `${date}_${type}`
  const presentIds = attendanceRecords[key] || []

  const activeUsers = users.filter(u => u.status === '현직')
  const records = activeUsers.map(u => ({
    id: u.id,
    fullName: u.fullName,
    department: u.department,
    contact: u.contact,
    serviceGroup: u.serviceGroup,
    bs: u.bs,
    avatar: u.avatar,
    present: presentIds.includes(u.id),
  }))

  const presentCount = records.filter(r => r.present).length
  const totalCount = records.length

  const deptOrder = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']
  const deptStats = {}

  deptOrder.forEach(dept => {
    const deptUsers = records.filter(r => r.department === dept)

    deptStats[dept] = {
      total: deptUsers.length,
      present: deptUsers.filter(r => r.present).length,
    }
  })

  return [200, {
    records,
    total: totalCount,
    presentCount,
    absentCount: totalCount - presentCount,
    rate: totalCount > 0 ? Math.round(presentCount / totalCount * 100) : 0,
    deptStats,
  }]
})

// 👉 월별 부서 평균 출석 통계
mock.onGet('/apps/attendance/monthly-stats').reply(config => {
  const { month, type } = config.params ?? {}
  const activeUsers = users.filter(u => u.status === '현직')
  const deptOrder = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']

  // 해당 월+타입에 해당하는 모든 출석 기록 키 수집
  const matchingKeys = Object.keys(attendanceRecords).filter(key => {
    const [date, t] = key.split('_')

    return date.startsWith(month) && t === type
  })

  const deptMonthlyStats = {}

  deptOrder.forEach(dept => {
    const deptUsers = activeUsers.filter(u => u.department === dept)
    const total = deptUsers.length

    if (matchingKeys.length === 0) {
      deptMonthlyStats[dept] = { total, presentAvg: 0, rate: 0, days: 0 }

      return
    }

    let presentSum = 0

    matchingKeys.forEach(key => {
      const presentIds = attendanceRecords[key] || []

      presentSum += deptUsers.filter(u => presentIds.includes(u.id)).length
    })

    const presentAvg = Math.round(presentSum / matchingKeys.length * 10) / 10
    const rate = total > 0 ? Math.round(presentAvg / total * 100) : 0

    deptMonthlyStats[dept] = { total, presentAvg, rate, days: matchingKeys.length }
  })

  return [200, { deptMonthlyStats, days: matchingKeys.length }]
})

// 👉 개인 출석 통계 (월간/분기/연간)
mock.onGet('/apps/attendance/user-stats').reply(config => {
  const { userId } = config.params ?? {}
  const id = Number(userId)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-based
  const quarter = Math.floor(month / 3)
  const qStart = quarter * 3 // quarter start month (0-based)

  const calcRate = filterFn => {
    const keys = Object.keys(attendanceRecords).filter(k => {
      const date = k.split('_')[0]

      return filterFn(date)
    })
    const total = keys.length
    const present = keys.filter(k => (attendanceRecords[k] || []).includes(id)).length

    return { total, present, rate: total > 0 ? Math.round(present / total * 100) : 0 }
  }

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const yearPrefix = `${year}-`

  const monthly = calcRate(d => d.startsWith(monthPrefix))
  const quarterly = calcRate(d => {
    if (!d.startsWith(yearPrefix)) return false
    const m = Number(d.split('-')[1]) - 1

    return m >= qStart && m < qStart + 3
  })
  const yearly = calcRate(d => d.startsWith(yearPrefix))

  return [200, {
    monthly: { ...monthly, label: `${month + 1}월` },
    quarterly: { ...quarterly, label: `${quarter + 1}분기` },
    yearly: { ...yearly, label: `${year}년` },
  }]
})

// 👉 개인 연도별 출석 통계
mock.onGet('/apps/attendance/user-yearly-stats').reply(config => {
  const { userId } = config.params ?? {}
  const id = Number(userId)
  const allKeys = Object.keys(attendanceRecords)

  // 연도 목록 추출
  const years = [...new Set(allKeys.map(k => k.split('-')[0]))].sort((a, b) => b - a)

  const yearlyStats = {}

  years.forEach(y => {
    const keys = allKeys.filter(k => k.startsWith(`${y}-`))
    const total = keys.length
    const present = keys.filter(k => (attendanceRecords[k] || []).includes(id)).length

    yearlyStats[Number(y)] = {
      total,
      present,
      rate: total > 0 ? Math.round(present / total * 100) : 0,
    }
  })

  return [200, { yearlyStats }]
})

mock.onPost('/apps/attendance').reply(config => {
  const { date, type, presentIds } = JSON.parse(config.data)
  const key = `${date}_${type}`

  attendanceRecords[key] = presentIds

  return [200]
})

// 👉 교사 삭제
mock.onDelete(/\/apps\/users\/\d+/).reply(config => {
  const userId = config.url?.substring(config.url.lastIndexOf('/') + 1)
  const Id = Number(userId)
  const userIndex = users.findIndex(e => e.id === Id)

  if (userIndex !== -1) {
    users.splice(userIndex, 1)

    return [200]
  }

  return [404]
})
