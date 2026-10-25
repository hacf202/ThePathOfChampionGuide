import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Flame,
  Compass,
  Layers,
  Star,
  Award,
  ChevronRight,
  Globe,
  Eye,
  Play,
  Crosshair,
  Cpu,
  Users,
  CheckCircle2,
  Info,
  Swords,
  BookOpen,
  Terminal,
  Copy,
  Check,
  Filter,
  ArrowUpRight,
  Lock,
  Unlock,
  Hexagon,
  Activity,
  Video,
  VideoOff,
  Clock,
  Target,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  RefreshCw,
  Film,
  CornerDownRight,
  Radio
} from 'lucide-react';

// ==================== DỮ LIỆU TƯỚNG CHUẨN THE PATH OF CHAMPIONS ====================
const CHAMPIONS_DB = {
  jinx: {
    id: 'jinx',
    code: '01PZ040',
    name: 'JINX',
    title: {
      vi: 'Khẩu Pháo Nổi Loạn',
      en: 'The Loose Cannon'
    },
    region: {
      vi: 'Piltover & Zaun',
      en: 'Piltover & Zaun'
    },
    regionCode: 'PZ',
    maxStars: 6,
    cost: 4,
    attack: 4,
    health: 3,
    levelUpAttack: 5,
    levelUpHealth: 4,
    keywords: ['Quick Attack'],
    tier: 'S+',
    accentColor: '#D2FF28', // Tactical Neon Lime
    secondaryColor: '#00F5D4', // Cyber Teal
    splashLv1: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040-full.png',
    splashLv2: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040T1-full.png',
    cardLv1: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040.png',
    cardLv2: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040T1.png',
    champSpell: {
      name: { vi: 'Hứng Chí! (Get Excited!)', en: 'Get Excited!' },
      cost: 3,
      desc: {
        vi: 'Hủy 1 lá bài trên tay để gây 3 sát thương lên bất kỳ mục tiêu nào.',
        en: 'To play, discard 1. Deal 3 to anything.'
      }
    },
    loreQuote: {
      vi: 'Một cơn lốc thuốc súng và đạn đạo! Trong Con Đường Anh Hùng, Jinx biến mọi lá bài bạn đánh hoặc hủy bỏ thành sát thương đốt trực tiếp vào Nhà Chính đối phương. Càng xả sạch tay nhanh, pháo hoa nổ càng lớn!',
      en: 'A whirlwind of gunpowder and ballistics! In The Path of Champions, Jinx turns every single card you play or discard into direct Nexus burn damage. The faster you empty your hand, the bigger the fireworks!'
    },
    bioGrid: {
      archetype: {
        vi: 'Đốt Nhà Chính / Xả Bài (Burn / Discard Aggro)',
        en: 'Direct Nexus Burn / Discard Aggro'
      },
      speed: {
        vi: 'S+ Tier // Tốc Độ Dọn Map Nhanh Nhất Game',
        en: 'S+ Tier // Fastest Adventure Speedrunner'
      },
      strengths: {
        vi: 'Sát thương chuẩn bỏ qua bàn đấu, kết liễu Boss ở Vòng 1-2',
        en: 'Unblockable Nexus ping damage, Turn 1-2 OTK potential'
      },
      weaknesses: {
        vi: 'Kẻ địch có hiệu ứng Tough (Kiên Cường) hoặc khóa sát thương',
        en: 'Enemy Nexus Toughness or damage cap mutators'
      }
    },
    stats: {
      damage: 10,
      defense: 6,
      speed: 10,
      consistency: 10,
      synergy: 9,
      independence: 10
    },
    passiveTrait: {
      name: {
        vi: 'Cơ Chế Cốt Lõi: Đêm Pháo Hoa Bất Tận',
        en: 'Core Engine: Endless Fireworks Barrage'
      },
      desc: {
        vi: 'Kết hợp Cổ Vật "Loose Cannon\'s Payload" cùng Sức Mạnh 3 Sao và 6 Sao, chỉ cần triệu hồi Jinx lên sân là bạn lập tức hủy toàn bộ tay, tạo hàng loạt Pháo Hoa + Tên Lửa Đạn Đạo và nhân đôi sát thương dội thẳng vào Nhà Chính kẻ địch.',
        en: 'Combining "The Loose Cannon\'s Payload" relic with her 3★ and 6★ Star Powers, summoning Jinx instantly discards your entire hand, generating Pow-Pows + Super Mega Death Rockets while doubling all spell and skill damage.'
      }
    },
    moves: [
      {
        id: 'jinx-star-1',
        category: 'STAR_POWERS',
        name: { vi: 'Đêm Hẳn Sẽ Vui I', en: 'What Could Go Wrong? I' },
        inputs: ['1★', 'PASSIVE'],
        badges: ['Star Power', 'Nexus Burn', 'Always Active'],
        cost: '30 Jinx Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040-full.png',
        desc: {
          vi: 'Khi bạn đánh một lá bài hoặc hủy bỏ một lá bài, gây 1 sát thương lên Nhà Chính của kẻ địch.',
          en: 'When you play a card or discard a card, deal 1 to the enemy Nexus.'
        },
        tip: {
          vi: 'Kích hoạt riêng lẻ cho từng lá bài bị hủy. Nếu hủy 5 lá cùng lúc bằng Payload, gây ngay 5 sát thương!',
          en: 'Triggers individually per card discarded. Discarding 5 cards via Payload deals 5 separate instances of damage!'
        },
        nodePos: { x: 18, y: 55, connectedTo: ['jinx-star-2'] }
      },
      {
        id: 'jinx-star-2',
        category: 'STAR_POWERS',
        name: { vi: 'Nổi Loạn Khắp Chốn', en: 'Loose Cannon\'s Fury' },
        inputs: ['2★', '+1 MANA'],
        badges: ['Star Power', 'Starting Mana', 'Card Draw'],
        cost: '20 Jinx Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040T2-full.png',
        desc: {
          vi: '+1 Đá Năng Lượng Khởi Đầu. Khi bắt đầu mỗi vòng đấu, rút thêm 1 lá bài Phù Du (Fleeting). Khi Jinx thăng cấp, tạo 1 Tên Lửa Đạn Đạo giảm 3 tiêu hao trên tay.',
          en: '+1 Starting Mana. Round Start: Draw 1 and give it Fleeting. When Jinx levels up, create a Super Mega Death Rocket! in hand that costs 3 less.'
        },
        tip: {
          vi: 'Lá bài Phù Du tự hủy cuối vòng cũng tự động kích hoạt sát thương của Sức Mạnh 1★ và 3★.',
          en: 'Fleeting cards that discard at Round End automatically trigger your 1★ and 3★ Star Powers!'
        },
        nodePos: { x: 34, y: 35, connectedTo: ['jinx-star-3', 'jinx-const-1'] }
      },
      {
        id: 'jinx-star-3',
        category: 'STAR_POWERS',
        name: { vi: 'Đêm Hẳn Sẽ Vui II', en: 'What Could Go Wrong? II' },
        inputs: ['3★', 'BURN + PING'],
        badges: ['Star Power', 'Board Control', 'Core Spike'],
        cost: '40 Jinx Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040T1-full.png',
        desc: {
          vi: 'Khi bạn đánh hoặc hủy bỏ một lá bài, gây 1 sát thương lên Nhà Chính địch VÀ 1 sát thương lên 1 kẻ địch ngẫu nhiên trên bàn.',
          en: 'When you play a card or discard a card, deal 1 to the enemy Nexus AND 1 to a random enemy unit.'
        },
        tip: {
          vi: 'Ngưỡng sức mạnh quan trọng nhất của Jinx: vừa dọn sạch bàn đối phương vừa rút máu Nhà Chính mà không cần giao tranh.',
          en: 'Jinx\'s most iconic power spike: simultaneously wipes the enemy board while melting their Nexus without declaring attacks.'
        },
        nodePos: { x: 50, y: 55, connectedTo: ['jinx-star-4', 'jinx-const-2'] }
      },
      {
        id: 'jinx-star-4',
        category: 'STAR_POWERS',
        name: { vi: 'Tiếp Đạn Tức Thì (Sorcery)', en: 'Sorcery (4★ Power)' },
        inputs: ['4★', 'SPELL MANA'],
        badges: ['Constellation', 'Round Start', 'Tempo'],
        cost: '40 Fragments + 10 Star Crystals',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ052-full.png',
        desc: {
          vi: 'Khi bắt đầu mỗi vòng đấu: Hồi đầy toàn bộ Năng Lượng Phép (3 Spell Mana).',
          en: 'Round Start: Refill your Spell Mana completely (3 Spell Mana).'
        },
        tip: {
          vi: 'Cho phép bạn bắn toàn bộ Pháo Hoa (Pow-Pow) và Tên Lửa ngay trong lượt triệu hồi Jinx.',
          en: 'Allows you to cast all generated Pow-Pows and Death Rockets on the exact turn you drop Jinx.'
        },
        nodePos: { x: 66, y: 30, connectedTo: ['jinx-star-5', 'jinx-star-6'] }
      },
      {
        id: 'jinx-star-5',
        category: 'STAR_POWERS',
        name: { vi: 'Dòng Chảy Hextech Vô Cực', en: 'Manaflow (5★ Power)' },
        inputs: ['5★', '+1 MANA'],
        badges: ['Constellation', 'Starting Mana', 'Turn 1 Jinx'],
        cost: '80 Fragments + 40 Star Crystals',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ039-full.png',
        desc: {
          vi: '+1 Đá Năng Lượng Khởi Đầu (Tổng cộng khởi đầu với 4 Mana ở Vòng 1).',
          en: '+1 Starting Mana (Start the game at 4 Mana on Turn 1).'
        },
        tip: {
          vi: 'Với 4 Mana khởi đầu, bạn có thể triệu hồi Jinx ngay lập tức ở hành động đầu tiên của ván đấu!',
          en: 'Starting at 4 Mana lets you summon Jinx on Action 1 of Turn 1 without needing cost reduction!'
        },
        nodePos: { x: 75, y: 70, connectedTo: ['jinx-star-6'] }
      },
      {
        id: 'jinx-star-6',
        category: 'STAR_POWERS',
        name: { vi: 'Pháo Hoa Cực Đại! (6★ Apex)', en: 'The Grand Finale! (6★ Apex)' },
        inputs: ['6★', 'NOVA', '2X DMG'],
        badges: ['6★ Legendary', 'Double Damage', 'Nightmare Crusher'],
        cost: '100 Fragments + 1 P&Z Nova Crystal',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040T1-full.png',
        desc: {
          vi: 'Mọi bài Phép, Kỹ Năng và Sức Mạnh đồng minh gây GẤP ĐÔI sát thương. Khi bạn tiêu diệt 1 đơn vị địch bằng Phép, tạo 1 Đạn Nổ trên tay.',
          en: 'Your Spells, Skills, and Powers deal DOUBLE damage. When you kill an enemy unit with a spell, create a flame-charged Pow-Pow in hand.'
        },
        tip: {
          vi: 'Biến mỗi phát nhảy sát thương 3★ thành 2 sát thương, và Tên Lửa Đạn Đạo gây 8 sát thương toàn diện!',
          en: 'Turns every 3★ discard ping into 2 damage, and Super Mega Death Rocket deals 8 damage to the Nexus and 2 to all enemies!'
        },
        nodePos: { x: 88, y: 48, connectedTo: [] }
      },
      {
        id: 'jinx-const-1',
        category: 'CONSTELLATION',
        name: { vi: 'Sao Phụ: Cải Tiến Thuốc Súng', en: 'Bonus Star: Powder Monkey Tech' },
        inputs: ['NODE', 'DECK BUFF'],
        badges: ['Bonus Star', 'Support Champ', 'Item Upgrade'],
        cost: '40 Jinx Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ012-full.png',
        desc: {
          vi: 'Tướng Hỗ Trợ bạn chọn trong chuyến phiêu lưu nhận được Trang Bị Anh Hùng: Khi triệu hồi, Hủy 1 lá để Rút 1 lá.',
          en: 'Support Champions you draft during adventures gain an Epic Item: When summoned, discard 1 to draw 1.'
        },
        tip: {
          vi: 'Giúp mọi Tướng Hỗ Trợ đều kích hoạt chuỗi combo xả bài của Jinx.',
          en: 'Ensures any Support Champion you pick immediately fuels Jinx\'s discard engine.'
        },
        nodePos: { x: 42, y: 20, connectedTo: ['jinx-star-4'] }
      },
      {
        id: 'jinx-const-2',
        category: 'CONSTELLATION',
        name: { vi: 'Sao Đá Quý: Bùng Nổ Kinh Nghiệm', en: 'Gemstone Node: Zaunite Ingenuity' },
        inputs: ['GEM', '+1 REROLL'],
        badges: ['Gemstone Node', 'Region Buff', 'Endgame'],
        cost: '150 P&Z Gemstones',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ056-full.png',
        desc: {
          vi: '+1 Lượt Đổi (Reroll) và +10% Kinh Nghiệm cho toàn bộ các tướng thuộc khu vực Piltover & Zaun.',
          en: '+1 Adventure Reroll and +10% Bonus XP for all Piltover & Zaun Champions.'
        },
        tip: {
          vi: 'Ưu tiên mở sau khi đã hoàn thiện nhánh 4★ và 6★ chính.',
          en: 'Unlock after securing your 4★ Sorcery and 6★ Grand Finale nodes.'
        },
        nodePos: { x: 58, y: 80, connectedTo: ['jinx-star-5'] }
      },
      {
        id: 'jinx-lv-18',
        category: 'LEVEL_UPGRADES',
        name: { vi: 'Cấp 18: Cò Súng Nhạy Bén', en: 'Level 18: Hair-Trigger Urchin' },
        inputs: ['LV 18', 'DECK ITEM'],
        badges: ['Level Upgrade', 'Zero Cost', 'Speed'],
        cost: 'Champion Level 18',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ045-full.png',
        desc: {
          vi: 'Nhóc Zaun (Zaunite Urchin) nhận thêm Trang Bị giảm 1 năng lượng (tổng tiêu hao = 0 Mana).',
          en: 'Zaunite Urchin gains Stopwatch / Cost Reduction (Total cost becomes 0 Mana).'
        },
        tip: {
          vi: 'Giúp bạn xả bài và rút bài hoàn toàn miễn phí ngay ở Vòng 1.',
          en: 'Lets you cycle cards and trigger discard burn for 0 Mana on Turn 1.'
        },
        nodePos: { x: 25, y: 82, connectedTo: ['jinx-star-3'] }
      },
      {
        id: 'jinx-lv-27',
        category: 'LEVEL_UPGRADES',
        name: { vi: 'Cấp 27: Tên Lửa Hủy Diệt', en: 'Level 27: Jury-Rigged Mastery' },
        inputs: ['LV 27', 'BURST SPEED'],
        badges: ['Level Upgrade', 'Free Summon', 'Synergy'],
        cost: 'Champion Level 27',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ028-full.png',
        desc: {
          vi: 'Bẫy Kẹp Thô Sơ (Jury-Rig) nhận Trang Bị +2/+2: Khi bị hủy, triệu hồi ngay đơn vị 3/3 hoàn toàn miễn phí.',
          en: 'Jury-Rig gains Studded Leather (+2/+2): When discarded, summons a 3/3 Scrap Scuttler at Burst speed for free.'
        },
        tip: {
          vi: 'Tạo ngay dàn chắn 3/3 trên bàn mỗi khi kích hoạt Payload của Jinx.',
          en: 'Creates instant 3/3 blockers/attackers at Burst speed when Jinx discards your hand.'
        },
        nodePos: { x: 12, y: 28, connectedTo: ['jinx-star-1'] }
      }
    ],
    startingDeck: [
      {
        name: { vi: 'Bẫy Kẹp Thô Sơ (Jury-Rig)', en: 'Jury-Rig' },
        cost: 1,
        type: 'Spell // Burst',
        item: { vi: 'Giáp Da (+2/+2 cho đơn vị triệu hồi)', en: 'Studded Leather (+2/+2 to summoned unit)' },
        unlockLv: 'Lv 3 & Lv 27',
        keepPriority: { vi: 'GIỮ LẠI (Mồi hủy bài tự triệu hồi 3/3)', en: 'KEEP (Free 3/3 body when discarded)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ028.png'
      },
      {
        name: { vi: 'Nhóc Zaun (Zaunite Urchin)', en: 'Zaunite Urchin' },
        cost: 1,
        type: 'Unit // 2/1',
        item: { vi: 'Đá Năng Lượng (-1 Mana, tốn 0 Mana)', en: 'Mana Potion (-1 Cost, plays for 0 Mana)' },
        unlockLv: 'Lv 9 & Lv 18',
        keepPriority: { vi: 'ƯU TIÊN SỐ 1 (Đánh 0 Mana kích Cướp Bóc)', en: 'TOP PRIORITY (0-Mana Plunder & Discard trigger)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ045.png'
      },
      {
        name: { vi: 'Cua Đồng Nát (Boomcrew Rookie)', en: 'Boomcrew Rookie' },
        cost: 2,
        type: 'Unit // 1/4',
        item: { vi: 'Búa Phá Thành (+2/+1 & Áp Đảo)', en: 'Battering Ram (+2/+1 & Overwhelm)' },
        unlockLv: 'Lv 6 & Lv 15',
        keepPriority: { vi: 'ĐỔI / XẢ BỎ (Dùng làm đạn cho Payload)', en: 'MULLIGAN / DISCARD FODDER' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ012.png'
      },
      {
        name: { vi: 'Chuyên Gia Chất Nổ (Flame Chompers!)', en: 'Flame Chompers!' },
        cost: 2,
        type: 'Unit // 0/2 Challenger',
        item: { vi: 'Khiên Cổ Đại (+2/+2 & Kiên Cường)', en: 'Phage (+2/+2 & Tough)' },
        unlockLv: 'Lv 12',
        keepPriority: { vi: 'GIỮ LẠI (Tự nhảy ra sân 2/4 khi bị hủy)', en: 'KEEP (Free 2/4 Challenger when discarded)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ056.png'
      },
      {
        name: { vi: 'Rummage (Lục Lọi)', en: 'Rummage' },
        cost: 2,
        type: 'Spell // Burst',
        item: { vi: 'Nước Mắt Nữ Thần (Giảm 1 Mana)', en: 'Tear of the Goddess (-1 Cost)' },
        unlockLv: 'Lv 21',
        keepPriority: { vi: 'GIỮ TÌNH HUỐNG (Rút kiếm Jinx nếu chưa có)', en: 'SITUATIONAL (Dig for Jinx on Turn 1)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ001.png'
      },
      {
        name: { vi: 'Sump Dredger (Kẻ Vét Cống)', en: 'Sump Dredger' },
        cost: 3,
        type: 'Unit // 4/3',
        item: { vi: 'Dây Chuyền Thanh Tẩy (Tạo 1 bản sao Phù Du)', en: 'Shadow Totem (Summon ephemeral copy)' },
        unlockLv: 'Lv 24',
        keepPriority: { vi: 'CẮT BỎ TẠI TRẠM Y TẾ (Hơi nặng Mana)', en: 'CUT AT HEALER NODE (Too slow)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ039.png'
      },
      {
        name: { vi: 'JINX', en: 'JINX' },
        cost: 4,
        type: 'Champion // 4/3 Quick Attack',
        item: { vi: '3 Ô Cổ Vật Tùy Chỉnh (Relic Slots)', en: '3 Custom Relic Slots Unlocked' },
        unlockLv: 'Lv 1 - Lv 30',
        keepPriority: { vi: 'BẮT BUỘC GIỮ (Chìa khóa thắng ngay Vòng 1)', en: 'MUST KEEP (Turn 1 Win Condition)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040.png'
      },
      {
        name: { vi: 'Kẻ Thí Nghiệm (Augmented Experimenter)', en: 'Augmented Experimenter' },
        cost: 6,
        type: 'Unit // 3/3',
        item: { vi: 'Ngọc Lục Bảo (-2 Năng Lượng tiêu hao)', en: 'Nomad\'s Medallion (-2 Cost)' },
        unlockLv: 'Lv 2',
        keepPriority: { vi: 'ĐỔI ĐẦU TRẬN (Giữ nếu muốn xả tay lần 2)', en: 'MULLIGAN AWAY (Turn 2-3 reload tool)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ052.png'
      }
    ],
    relicSets: {
      BIS_ENDGAME: {
        id: 'BIS_ENDGAME',
        starReq: '6★ OPTIMAL',
        difficulty: { vi: 'DỄ // AUTO-WIN', en: 'EASY // AUTO-WIN' },
        label: { vi: 'CHUẨN 6★ ÁC MỘNG (BIS ENDGAME)', en: 'BIS 6★ NIGHTMARE LOADOUT' },
        winRate: '99.4%',
        clearTime: '04m 15s',
        summary: {
          vi: 'Combo bất khả chiến bại cho Map 6.5★: Đánh 1 lá 0 Mana kích Cướp Bóc, triệu hồi Jinx với 2 Mana, hủy toàn bộ tay tạo mưa Pháo Hoa + Tên Lửa nhân đôi sát thương.',
          en: 'The undisputed god-tier combo for 6.5★ Nightmares: Trigger Plunder with any 0-cost card, drop Jinx for 2 Mana, discard your hand to level up instantly, and fire double-damage Death Rockets.'
        },
        slots: [
          {
            name: { vi: 'Đạn Dược Của Khẩu Pháo Nổi Loạn', en: 'The Loose Cannon\'s Payload' },
            rarity: 'RARE',
            icon: '💣',
            effect: {
              vi: 'Khi triệu hồi tôi, hủy toàn bộ bài trên tay. Với mỗi lá bị hủy, tạo 1 Pháo Hoa (Pow-Pow) trên tay.',
              en: 'When I\'m summoned, discard your hand. Create a Pow-Pow in hand for each card discarded.'
            },
            synergyNote: {
              vi: 'Trái tim của Jinx! Hủy 5-6 lá trên tay giúp Jinx Thăng Cấp ngay lập tức, kích hoạt 6 lần sát thương nổ Nhà Chính (x2 nhờ 6★) và lấp đầy tay lại để lấy Tên Lửa Đạn Đạo.',
              en: 'Jinx\'s core engine! Discarding 5-6 cards levels Jinx up on the spot, triggers 6 separate Nexus burn pings (doubled by 6★), and refills your hand with Pow-Pows.'
            }
          },
          {
            name: { vi: 'Áo Choàng Xương Cá (Packed Powder)', en: 'Packed Powder' },
            rarity: 'EPIC',
            icon: '🧨',
            effect: {
              vi: 'Cướp Bóc (Plunder): Tôi giảm 2 tiêu hao. Khi bắt đầu vòng, nếu bạn gây sát thương lên Nhà Chính địch vòng này, nhận +1/+1.',
              en: 'Plunder: I cost 2 less. Round Start: If you damaged the enemy Nexus this round, grant me +1/+1.'
            },
            synergyNote: {
              vi: 'Vì Sức Mạnh 1★/3★ của Jinx tự động gây sát thương vào Nhà Chính địch khi bạn đánh BẤT KỲ lá bài nào, chỉ cần đánh 1 lá 0 Mana là kích hoạt Cướp Bóc, giảm giá Jinx từ 4 xuống 2 Mana!',
              en: 'Because Jinx\'s 1★/3★ power damages the enemy Nexus whenever you play ANY card, playing a single 0-cost card triggers Plunder and discounts Jinx to 2 Mana!'
            }
          },
          {
            name: { vi: 'Đại Bác Liên Thanh (Big Guns)', en: 'Big Guns' },
            rarity: 'EPIC',
            icon: '🚀',
            effect: {
              vi: 'Sức Mạnh: Mọi bài Phép và Kỹ Năng của bạn gây thêm +1 sát thương (Nhân đôi thành +2 khi có 6★!).',
              en: 'Power: All of your Spells and Skills deal 1 extra damage (Doubled to +2 with Jinx 6★!).'
            },
            synergyNote: {
              vi: 'Khi kết hợp với Chòm Sao 6★ (nhân đôi sát thương), +1 sát thương gốc từ Big Guns biến thành +2. Tên Lửa Đạn Đạo sẽ gây tới (4+1)x2 = 10 sát thương lên Nhà Chính địch!',
              en: 'Stacked with her 6★ power (double damage), Big Guns\' +1 base bonus becomes +2. Super Mega Death Rocket slams the enemy Nexus for (4+1)x2 = 10 damage!'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Đổi toàn bộ bài nếu chưa có Jinx trên tay! Nếu đã có Jinx, ưu tiên giữ lại Nhóc Zaun (Zaunite Urchin - 0 Mana), Bẫy Kẹp Thô Sơ (Jury-Rig) hoặc Chuyên Gia Chất Nổ (Flame Chompers).',
            en: 'Hard mulligan everything until Jinx is in your opening hand! Once you have Jinx, keep Zaunite Urchin (0 Mana), Jury-Rig, or Flame Chompers as free discard fodder.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'VÒNG 1 // MỞ MÀN KÍCH CƯỚP BÓC', en: 'TURN 1 // PLUNDER IGNITION' },
              action: {
                vi: 'Đánh 1 lá bài 0 Mana (Nhóc Zaun) hoặc hủy bài. Sức mạnh 3★ tự bắn 2 sát thương vào Nhà Chính địch -> Kích hoạt hiệu ứng Cướp Bóc (Plunder) của Packed Powder.',
                en: 'Play any 0-cost card (Zaunite Urchin). Your 3★ power automatically pings the enemy Nexus for 2 damage -> Instantly activates Packed Powder\'s Plunder discount.'
              },
              videoTime: 12,
              timeLabel: '00:12'
            },
            {
              step: '02',
              phase: { vi: 'VÒNG 1 // TRIỆU HỒI JINX & XẢ KHO ĐẠN', en: 'TURN 1 // PAYLOAD DETONATION' },
              action: {
                vi: 'Triệu hồi Jinx (lúc này chỉ tốn 2 Mana). Cổ vật Payload kích hoạt: Hủy toàn bộ 5-6 lá trên tay -> Gây 20-24 sát thương nổ trực tiếp và Jinx lập tức Thăng Cấp!',
                en: 'Summon Jinx for just 2 Mana. Payload triggers: Discards all 5-6 cards in hand -> Deals 20-24 direct Nexus burn damage and levels up Jinx on the spot!'
              },
              videoTime: 45,
              timeLabel: '00:45'
            },
            {
              step: '03',
              phase: { vi: 'VÒNG 1 // KÍCH HOẠT TÊN LỬA HỦY DIỆT', en: 'TURN 1 // GRAND FINALE ROCKET' },
              action: {
                vi: 'Dùng 3 Năng Lượng Phép (từ Sorcery 4★) bắn 2 quả Pháo Hoa (Pow-Pow) để dọn quái và làm trống tay lần 2 -> Nhận Tên Lửa Đạn Đạo 1 Mana bắn thêm 10 sát thương kết liễu Boss!',
                en: 'Spend your 3 Spell Mana (from 4★ Sorcery) to cast Pow-Pows, emptying your hand a second time -> Generate a 1-cost Super Mega Death Rocket for 10 Nexus damage!'
              },
              videoTime: 95,
              timeLabel: '01:35'
            }
          ],
          proTips: [
            {
              vi: 'Mẹo Quản Lý Tay Đầy (Hand Size 10): Nếu khi triệu hồi Jinx bạn có đúng 10 lá trên tay, Payload sẽ hủy 9 lá và tạo 9 Pháo Hoa -> Làm đầy tay nên Tên Lửa từ 2★ bị cháy mất. Hãy đánh bớt 1 lá xuống còn 8-9 lá trước khi thả Jinx!',
              en: 'Hand Size Overflow Rule: If you summon Jinx with 9 other cards in hand, Payload replaces all 9 with Pow-Pows, leaving no room for the 2★ level-up Death Rocket. Play down to 7-8 cards first!'
            },
            {
              vi: 'Khắc Chế Lissandra (Map Tuyết Lạnh): Lissandra tăng giá bài nếu bạn đánh quá 3 lá mỗi vòng. Nhờ Payload hủy toàn bộ tay trong CHỈ 1 HÀNH ĐỘNG đánh Jinx, bạn gây 30+ sát thương mà không bị phạt tăng Mana!',
              en: 'Lissandra Counterplay: Lissandra taxes cards after playing 3 cards per round. Because dropping Jinx discards your whole hand in a SINGLE card play action, you bypass her tax completely!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: 'U4b8X5wG2rQ',
          title: {
            vi: 'JINX 6★ BIS vs 6.5★ Ác Mộng Lissandra & Fiddlesticks (Turn 1 OTK)',
            en: '6★ JINX BIS Loadout vs 6.5★ Nightmare Lissandra & Fiddlesticks (Turn 1 OTK)'
          },
          bossTag: 'VS 6.5★ NIGHTMARE LISSANDRA',
          duration: '02:45',
          patch: 'PATCH 5.10 META',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Cấu hình Cổ Vật & Chọn bài mở màn (Mulligan)', en: 'Relic Setup & Opening Mulligan' } },
            { time: 12, label: '00:12', title: { vi: 'Bước 1: Kích hoạt Cướp Bóc giảm 2 Mana', en: 'Step 1: 0-Mana Plunder Trigger' } },
            { time: 45, label: '00:45', title: { vi: 'Bước 2: Triệu hồi Jinx & Nổ Payload x2 Sát thương', en: 'Step 2: Jinx Summon & Payload Barrage' } },
            { time: 95, label: '01:35', title: { vi: 'Bước 3: Bắn Tên Lửa Đạn Đạo 10 Sát thương kết liễu', en: 'Step 3: 10-Damage Death Rocket Finisher' } }
          ]
        }
      },

      SPEEDRUN: {
        id: 'SPEEDRUN',
        starReq: '4★ - 6★ SPEEDRUN',
        difficulty: { vi: 'TRUNG BÌNH // COMBO NHÂN BẢN', en: 'MEDIUM // CLONE LOOP' },
        label: { vi: 'NHÂN BẢN PHÁO HOA (GUARDIAN ANGEL OTK)', en: 'CLONE LOOP OTK (GUARDIAN ANGEL)' },
        winRate: '98.8%',
        clearTime: '02m 40s',
        summary: {
          vi: 'Tối ưu hóa việc triệu hồi Jinx 2-3 lần liên tiếp trong cùng Vòng 1 bằng Guardian Angel + bài tự sát/bản sao Phù Du để xả tay liên hoàn.',
          en: 'Maximizes double and triple summon triggers on Turn 1 using Guardian Angel to discard your hand multiple times in a single round.'
        },
        slots: [
          {
            name: { vi: 'Đạn Dược Của Khẩu Pháo Nổi Loạn', en: 'The Loose Cannon\'s Payload' },
            rarity: 'RARE',
            icon: '💣',
            effect: {
              vi: 'Khi triệu hồi, hủy toàn bộ tay và lấp đầy tay bằng Pháo Hoa.',
              en: 'When summoned, discard your hand and replace each card with Pow-Pow.'
            },
            synergyNote: {
              vi: 'Mỗi lần Jinx hồi sinh từ Guardian Angel được tính là 1 lần Triệu Hồi mới -> Kích hoạt lại Payload hủy toàn bộ số Pháo Hoa vừa tạo ra!',
              en: 'Every time Jinx revives from Guardian Angel, it counts as a fresh Summon -> Re-triggers Payload to discard all Pow-Pows you just created!'
            }
          },
          {
            name: { vi: 'Giáp Thiên Thần (Guardian Angel)', en: 'Guardian Angel' },
            rarity: 'RARE',
            icon: '🪽',
            effect: {
              vi: 'Bắt đầu trận với +1 Hồi Sinh. Khi tôi chết lần đầu trong trận, hồi sinh tôi.',
              en: 'Start Adventure with +1 Revive. First time I die, revive me.'
            },
            synergyNote: {
              vi: 'Nếu bạn tự bắn Pháo Hoa vào chính Jinx (hoặc có trang bị tạo bản sao Phù Du Shadow Totem), Guardian Angel sẽ sinh ra 2 Jinx trên bàn và xả tay 2 lần liên tiếp!',
              en: 'If you cast Pow-Pow on your own Jinx (or draft Shadow Totem / Stabilize), Guardian Angel revives her and triggers a second full-hand discard!'
            }
          },
          {
            name: { vi: 'Kho Báu Hải Tặc (The Scourge\'s Stash)', en: 'The Scourge\'s Stash' },
            rarity: 'RARE',
            icon: '🪙',
            effect: {
              vi: 'Cướp Bóc (Plunder): Tôi giảm 2 năng lượng tiêu hao.',
              en: 'Plunder: I cost 2 less.'
            },
            synergyNote: {
              vi: 'Phiên bản Rare hoàn hảo thay thế cho Packed Powder, đảm bảo Jinx luôn ra sân với 2 Mana ngay ở Vòng 1.',
              en: 'Accessible Rare alternative to Packed Powder, guaranteeing a 2-Mana Jinx drop on Turn 1.'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Giữ Jinx và bất kỳ lá bài rẻ tiền nào (0-1 Mana). Trong chuyến phiêu lưu, ưu tiên chọn Sức Mạnh "Stabilize" (Tạo bản sao Phù Du khi triệu hồi Tướng) hoặc trang bị "Shadow Totem".',
            en: 'Keep Jinx and any 0-1 cost card. During the adventure, prioritize drafting "Stabilize" or "Shadow Totem" to automate the Guardian Angel clone loop.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'BƯỚC 1 // KÍCH CƯỚP BÓC & HẠ JINX', en: 'STEP 1 // PLUNDER & DROP JINX' },
              action: {
                vi: 'Đánh 1 lá bài rẻ để bắn 1 sát thương vào Nhà Chính địch, sau đó triệu hồi Jinx với giá 2 Mana -> Xả tay lần 1 (nhận 6-7 Pháo Hoa).',
                en: 'Play a cheap card to ping the enemy Nexus, then summon Jinx for 2 Mana -> First full hand discard (creates 6-7 Pow-Pows).'
              },
              videoTime: 18,
              timeLabel: '00:18'
            },
            {
              step: '02',
              phase: { vi: 'BƯỚC 2 // KÍCH HOẠT HỒI SINH GUARDIAN ANGEL', en: 'STEP 2 // TRIGGER GUARDIAN ANGEL REVIVE' },
              action: {
                vi: 'Nếu có bản sao Phù Du của Jinx (hoặc tự dùng Phép hạ gục Jinx 3 máu), Guardian Angel lập tức hồi sinh Jinx mới -> Payload kích hoạt lần 2 hủy sạch 7 Pháo Hoa trên tay!',
                en: 'When an Ephemeral copy of Jinx dies (or you self-ping Jinx), Guardian Angel revives her -> Payload triggers a SECOND time, discarding all 7 Pow-Pows!'
              },
              videoTime: 55,
              timeLabel: '00:55'
            },
            {
              step: '03',
              phase: { vi: 'BƯỚC 3 // CƠN MƯA TÊN LỬA KÉP', en: 'STEP 3 // DOUBLE DEATH ROCKET FINISHER' },
              action: {
                vi: 'Với 2 Jinx trên bàn, mỗi lần bạn làm trống tay sẽ tạo ra 2 quả Tên Lửa Đạn Đạo cùng lúc, thổi bay 99 máu của Boss Ác Mộng trong chưa đầy 1 phút!',
                en: 'With 2 Jinxes on board, emptying your hand generates TWO Super Mega Death Rockets simultaneously, melting 99-HP Nightmare bosses in seconds!'
              },
              videoTime: 110,
              timeLabel: '01:50'
            }
          ],
          proTips: [
            {
              vi: 'Tương tác cực mạnh với trang bị "Khi triệu hồi, tạo bản sao Phù Du" (Shadow Totem): Khi bản sao Phù Du tự chết cuối vòng hoặc sau khi tấn công, Guardian Angel sẽ hồi sinh ra 1 Jinx vĩnh viễn thứ 2!',
              en: 'Shadow Totem Exploit: When the Ephemeral Jinx copy dies, Guardian Angel revives it as a permanent second Jinx, triggering Payload again!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: '9bZkp7q19f0',
          title: {
            vi: 'JINX Nhân Bản Guardian Angel vs 5.5★ Swain (02m 40s Speedrun)',
            en: 'JINX Guardian Angel Clone Loop vs 5.5★ Swain Adventure (02m 40s Speedrun)'
          },
          bossTag: 'VS 5.5★ SWAIN SIEGE',
          duration: '02:15',
          patch: 'SPEEDRUN RECORD',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Chọn Sức Mạnh Stabilize / Shadow Totem', en: 'Drafting Stabilize / Shadow Totem' } },
            { time: 18, label: '00:18', title: { vi: 'Bước 1: Triệu hồi Jinx & Xả tay lần 1', en: 'Step 1: First Payload Detonation' } },
            { time: 55, label: '00:55', title: { vi: 'Bước 2: Hồi sinh Guardian Angel & Xả tay lần 2', en: 'Step 2: Guardian Angel Revive Loop' } },
            { time: 110, label: '01:50', title: { vi: 'Bước 3: Hai Jinx bắn đôi Tên Lửa Đạn Đạo', en: 'Step 3: Twin Jinx Death Rocket Barrage' } }
          ]
        }
      },

      F2P_RARE: {
        id: 'F2P_RARE',
        starReq: '3★ F2P STARTER',
        difficulty: { vi: 'DỄ // KHÔNG CẦN EPIC', en: 'EASY // NO EPICS NEEDED' },
        label: { vi: 'CƠ BẢN / KHÔNG CẦN EPIC (F2P)', en: 'F2P / NO EPIC RELICS' },
        winRate: '96.5%',
        clearTime: '05m 30s',
        summary: {
          vi: 'Bộ Cổ Vật 100% miễn phí từ nhiệm vụ cốt truyện nhưng vẫn dư sức nghiền nát Aurelion Sol 4★ và Lissandra 5★.',
          en: '100% accessible Rare/Common relics from story campaigns that still effortlessly crush 4★ Aurelion Sol & 5★ Lissandra.'
        },
        slots: [
          {
            name: { vi: 'Đạn Dược Của Khẩu Pháo Nổi Loạn', en: 'The Loose Cannon\'s Payload' },
            rarity: 'RARE',
            icon: '💣',
            effect: {
              vi: 'Nhận miễn phí từ Nhiệm Vụ Cốt Truyện 2★ của Vi.',
              en: 'Obtained for free from completing Vi\'s 2★ Campaign Adventure.'
            },
            synergyNote: {
              vi: 'Cổ vật bắt buộc duy nhất của Jinx và bạn được tặng miễn phí ngay khi mở khóa cốt truyện của Vi!',
              en: 'Jinx\'s only mandatory relic, and it is awarded for free from Vi\'s 2★ story campaign!'
            }
          },
          {
            name: { vi: 'Đại Bác của Luden (Luden\'s Tempest)', en: 'Luden\'s Tempest' },
            rarity: 'RARE',
            icon: '🔮',
            effect: {
              vi: 'Khi tôi ở trên sân, mọi bài Phép và Kỹ Năng gây thêm +1 sát thương.',
              en: 'While I\'m on board, all your Spells and Skills deal +1 damage.'
            },
            synergyNote: {
              vi: 'Tăng sát thương cho mọi quả Pháo Hoa (từ 3 lên 4 sát thương) và Tên Lửa Đạn Đạo (từ 4 lên 5 sát thương lên Nhà Chính).',
              en: 'Boosts every Pow-Pow to 4 damage and Super Mega Death Rocket to 5 Nexus damage + 2 AoE.'
            }
          },
          {
            name: { vi: 'Chương Thất Truyền (Lost Chapter)', en: 'Lost Chapter' },
            rarity: 'COMMON',
            icon: '📖',
            effect: {
              vi: 'Khi triệu hồi tôi, hồi đầy Năng Lượng Phép (3 Spell Mana).',
              en: 'When I\'m summoned, refill your Spell Mana.'
            },
            synergyNote: {
              vi: 'Khi chưa mở khóa Chòm Sao 4★ (Sorcery), Lost Chapter giúp bạn có ngay 3 Mana Phép lúc vừa đánh Jinx để bắn ngay Tên Lửa Đạn Đạo!',
              en: 'Before unlocking her 4★ Sorcery node, Lost Chapter gives you 3 instant Spell Mana on summon to cast your generated Death Rocket immediately!'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Giữ Jinx, Zaunite Urchin và Jury-Rig. Ở Vòng 1 và Vòng 2, hãy đánh các đơn vị nhỏ ra bàn để tích trữ năng lượng trước khi triệu hồi Jinx ở Vòng 2 (khi đủ 4 Mana).',
            en: 'Keep Jinx, Zaunite Urchin, and Jury-Rig. On Turn 1, play cheap units to chip the enemy, then drop Jinx on Turn 2 at 4 Mana.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'VÒNG 1 // XÂY DỰNG BÀN ĐẤU & TÍCH BÀI', en: 'TURN 1 // HAND SETUP & CHIP DAMAGE' },
              action: {
                vi: 'Giữ lại nhiều bài trên tay nhất có thể (6-8 lá). Chỉ đánh các lá bài tự rút thêm bài như Nhóc Zaun.',
                en: 'Hold onto 6-8 cards in hand. Only play cantrips like Zaunite Urchin that replace themselves.'
              },
              videoTime: 10,
              timeLabel: '00:10'
            },
            {
              step: '02',
              phase: { vi: 'VÒNG 2 // HẠ JINX & HỒI ĐẦY MANA PHÉP', en: 'TURN 2 // SUMMON JINX + LOST CHAPTER' },
              action: {
                vi: 'Ở Vòng 2 (4 Mana), triệu hồi Jinx. Payload hủy toàn bộ tay giúp Jinx thăng cấp, đồng thời Lost Chapter hồi ngay 3 Mana Phép.',
                en: 'On Turn 2 (4 Mana), summon Jinx. Payload levels her up while Lost Chapter refills 3 Spell Mana on the spot.'
              },
              videoTime: 40,
              timeLabel: '00:40'
            },
            {
              step: '03',
              phase: { vi: 'VÒNG 2 // XẢ PHÁO HOA KẾT LIỄU', en: 'TURN 2 // LUDEN\'S ROCKET BARRAGE' },
              action: {
                vi: 'Dùng 3 Mana Phép vừa được hồi từ Lost Chapter để bắn Tên Lửa Đạn Đạo (1 Mana) + Pháo Hoa (2 Mana) được cộng sát thương từ Luden!',
                en: 'Spend the 3 refilled Spell Mana to fire your 1-cost Super Mega Death Rocket + 2-cost Pow-Pow boosted by Luden\'s Tempest!'
              },
              videoTime: 75,
              timeLabel: '01:15'
            }
          ],
          proTips: [
            {
              vi: 'Khi bạn đã mở khóa Nút 4★ (Sorcery - tự hồi 3 Mana Phép mỗi vòng), hãy thay "Lost Chapter" bằng "The Scourge\'s Stash" (Cướp Bóc giảm 2 Mana) để đánh Jinx ngay từ Vòng 1!',
              en: 'Once you unlock Jinx\'s 4★ Sorcery node, swap out Lost Chapter for The Scourge\'s Stash so you can drop Jinx on Turn 1!'
            }
          ]
        },
        // Mặc định để null ở chế độ AUTO để demo giao diện Fallback khi 1 bộ Build chưa có Video, hoặc bật bằng nút "ALL ON"
        videoShowcase: null,
        fallbackVideoShowcase: {
          youtubeId: 'dQw4w9WgXcQ',
          title: {
            vi: 'JINX 3★ F2P Build (Không Epic) vượt ải Aurelion Sol 4★',
            en: '3★ F2P Jinx (No Epics) Full Clear vs 4★ Aurelion Sol'
          },
          bossTag: 'VS 4★ AURELION SOL',
          duration: '03:50',
          patch: 'F2P GUIDE',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Cách lấy Cổ Vật Payload từ cốt truyện Vi', en: 'How to unlock Payload from Vi Campaign' } },
            { time: 10, label: '00:10', title: { vi: 'Vòng 1: Giữ bài tối ưu sát thương hủy', en: 'Turn 1: Holding Cards for Maximum Discard' } },
            { time: 40, label: '00:40', title: { vi: 'Vòng 2: Combo Jinx + Lost Chapter', en: 'Turn 2: Jinx + Lost Chapter Refill' } },
            { time: 75, label: '01:15', title: { vi: 'Kết liễu Boss bằng Tên Lửa Luden', en: 'Luden\'s Death Rocket Lethal' } }
          ]
        }
      }
    },
    recommendations: {
      powers: [
        { name: { vi: 'Nhanh Trí (Quick Draw)', en: 'Quick Draw' }, rarity: 'RARE', desc: { vi: 'Khi rút bài, giảm 1 tiêu hao của lá đó trong vòng này.', en: 'Cards you draw cost 1 less this round.' } },
        { name: { vi: 'Bậc Thầy Hủy Bài (Higher Education)', en: 'Higher Education' }, rarity: 'COMMON', desc: { vi: 'Khi rút bài, đồng minh nhận +1/+0 trong vòng này.', en: 'When you draw a card, give allies +1/+0 this round.' } },
        { name: { vi: 'Năng Lượng Hoàn Trả (Spellslinger)', en: 'Spellslinger' }, rarity: 'RARE', desc: { vi: 'Bài phép của bạn giảm 1 năng lượng tiêu hao.', en: 'Your spells cost 1 less.' } }
      ],
      items: [
        { name: { vi: 'Bóng Ma Hộ Mệnh (Shadow Totem)', en: 'Shadow Totem' }, rarity: 'RARE', desc: { vi: 'Triệu hồi 1 bản sao Phù Du của tôi (Xả tay 2 lần với Jinx!).', en: 'Summon an Ephemeral copy of me (Double Payload trigger!).' } },
        { name: { vi: 'Nước Mắt Nữ Thần (Tear of the Goddess)', en: 'Tear of the Goddess' }, rarity: 'COMMON', desc: { vi: 'Giảm 1 tiêu hao cho bài phép Pháo Hoa / Lục Lọi.', en: 'Reduces spell cost by 1.' } }
      ],
      supportChamps: [
        { name: 'Twisted Fate', region: 'Bilgewater', synergy: 'S+ Tier // Rút bài & Xả bài liên tục' },
        { name: 'Draven', region: 'Noxus', synergy: 'S+ Tier // Tạo Rìu Xoay 0 Mana làm mồi hủy' },
        { name: 'Sion', region: 'Noxus', synergy: 'S Tier // Tự động triệu hồi khi bị hủy bài' },
        { name: 'Ekko', region: 'Piltover & Zaun', synergy: 'A+ Tier // Tiên Tri & Rút bài tốc độ cao' }
      ]
    },
    communityRatings: [
      {
        user: 'Zaun Warlord // VN',
        stars: '6★',
        rating: 10,
        loadoutUsed: 'BIS 6★ NIGHTMARE LOADOUT',
        comment: {
          vi: 'Cứ map nào khó quá hoặc lười suy nghĩ là mang Jinx 6★ vào. Bấm đúng 1 nút thả Jinx ở Turn 1 là Boss bay nửa cây máu!',
          en: 'Whenever a Nightmare weekly mutator is annoying, I just lock in 6★ Jinx. Drop her on Turn 1 and watch the boss Nexus evaporate!'
        }
      },
      {
        user: 'SpeedrunKing_LoR',
        stars: '6★',
        rating: 9.8,
        loadoutUsed: 'CLONE LOOP OTK (GUARDIAN ANGEL)',
        comment: {
          vi: 'Build Guardian Angel + Payload thực sự điên rồ khi bắt được Shadow Totem. 2 quả Tên Lửa 10 sát thương mỗi vòng!',
          en: 'The Guardian Angel + Payload build is insane once you hit Shadow Totem. Double 10-damage Death Rockets every round!'
        }
      }
    ]
  },

  aurelionsol: {
    id: 'aurelionsol',
    code: '03MT087',
    name: 'AURELION SOL',
    title: {
      vi: 'Ác Long Thượng Giới',
      en: 'The Star Forger'
    },
    region: {
      vi: 'Targon',
      en: 'Targon'
    },
    regionCode: 'MT',
    maxStars: 4,
    cost: 10,
    attack: 10,
    health: 10,
    levelUpAttack: 11,
    levelUpHealth: 11,
    keywords: ['Fury', 'SpellShield'],
    tier: 'GOD',
    accentColor: '#00F5D4', // Cosmic Cyan
    secondaryColor: '#D2FF28', // Tactical Lime
    splashLv1: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087-full.png',
    splashLv2: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087T1-full.png',
    cardLv1: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087.png',
    cardLv2: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087T1.png',
    champSpell: {
      name: { vi: 'Bầu Trời Sụp Đổ (The Skies Descend)', en: 'The Skies Descend' },
      cost: 15,
      desc: {
        vi: 'Gây 15 sát thương lên toàn bộ kẻ địch. Giảm 2 tiêu hao với mỗi Rồng hoặc Thượng Nhân bạn có.',
        en: 'Deal 15 to all enemies. Costs 2 less for each Dragon or Celestial ally you control.'
      }
    },
    loreQuote: {
      vi: 'Vị thần tối thượng của Chế độ Thử Thách Hàng Tháng! Dù chỉ có tối đa 4 Sao, sức mạnh của Aurelion Sol vượt xa hầu hết các tướng 6 Sao nhờ khả năng giảm tiêu hao toàn bộ Tướng về 0 Mana và tự động Thăng Cấp mọi Tướng khi đánh ra!',
      en: 'The undisputed deity of Monthly Challenges! Even capped at 4 Stars, Aurelion Sol eclipses almost every 6-Star champion by discounting your entire hand to 0 Mana and instantly leveling up every Champion upon play!'
    },
    bioGrid: {
      archetype: {
        vi: 'Tạo Bài Vũ Trụ / Giảm Năng Lượng (Cosmic Ramp)',
        en: 'Cosmic Creation / Cost-Reduction Ramp'
      },
      speed: {
        vi: 'GOD Tier // Vua Thử Thách Hàng Tháng',
        en: 'GOD Tier // Supreme Monthly Boss Slayer'
      },
      strengths: {
        vi: 'Mọi bài tạo ra đều nhân đôi chỉ số & giảm giá toàn bộ Tướng',
        en: 'Created cards double stats & reduce all Champion costs by 2'
      },
      weaknesses: {
        vi: 'Chỉ nhận được Mảnh Tướng qua Thử Thách Hàng Tháng',
        en: 'Fragments exclusively gated behind Monthly Challenges'
      }
    },
    stats: {
      damage: 10,
      defense: 10,
      speed: 9,
      consistency: 10,
      synergy: 10,
      independence: 10
    },
    passiveTrait: {
      name: {
        vi: 'Cơ Chế Cốt Lõi: Kiến Tạo Tinh Vân Thượng Giới',
        en: 'Core Engine: Celestial Singularity'
      },
      desc: {
        vi: 'Mỗi khi bạn đánh một lá bài Được Tạo Ra (Created Card), toàn bộ Tướng trên tay và trên bộ bài được giảm 2 Mana tiêu hao. Chỉ sau 3-4 lá bài tạo ra ở Vòng 1, Aurelion Sol 10 Mana sẽ có giá 0 Mana và biến toàn bộ bài Thượng Giới thành miễn phí!',
        en: 'Every time you play a Created Card, all Champions everywhere have their cost reduced by 2. Play just 3-4 created cards on Turn 1 to drop a 10-cost Aurelion Sol for 0 Mana!'
      }
    },
    moves: [
      {
        id: 'asol-star-1',
        category: 'STAR_POWERS',
        name: { vi: 'Thiên Hà Sáng Tạo I', en: 'The Star Forger\'s Design I' },
        inputs: ['1★', '-1 CHAMP COST'],
        badges: ['Star Power', 'Cost Reduction', 'Created Synergy'],
        cost: '30 Aurelion Sol Fragments',
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087-full.png',
        desc: {
          vi: 'Khi bạn đánh một lá bài được tạo ra, giảm 1 năng lượng tiêu hao cho mọi Tướng ở mọi nơi.',
          en: 'When you play a created card, reduce the cost of all Champions everywhere by 1.'
        },
        tip: {
          vi: 'Áp dụng cho cả bài Kêu Gọi (Invoke), bài tạo từ Cổ Vật và cả Tướng Hỗ Trợ.',
          en: 'Applies to Invoked cards, Relic-generated cards, and discounts Support Champions too!'
        },
        nodePos: { x: 20, y: 50, connectedTo: ['asol-star-2'] }
      },
      {
        id: 'asol-star-2',
        category: 'STAR_POWERS',
        name: { vi: 'Quyền Năng Thượng Giới', en: 'Cosmic Ascension' },
        inputs: ['2★', 'AUTO LEVEL UP'],
        badges: ['Star Power', '+1 Mana', 'Instant Level 2'],
        cost: '50 Aurelion Sol Fragments',
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087T1-full.png',
        desc: {
          vi: '+1 Đá Năng Lượng Khởi Đầu. Khi bạn ĐÁNH một Tướng, Tướng đó lập tức THĂNG CẤP!',
          en: '+1 Starting Mana. When you PLAY a Champion, they immediately LEVEL UP!'
        },
        tip: {
          vi: 'Thậm chí các Tướng có điều kiện thăng cấp khó nhất như Katarina, Fiora hay Ryze cũng thăng cấp ngay lập tức!',
          en: 'Even Champions with complex level conditions immediately flip to Level 2 on play!'
        },
        nodePos: { x: 45, y: 30, connectedTo: ['asol-star-3'] }
      },
      {
        id: 'asol-star-3',
        category: 'STAR_POWERS',
        name: { vi: 'Thiên Hà Sáng Tạo II', en: 'The Star Forger\'s Design II' },
        inputs: ['3★', '-2 CHAMP COST'],
        badges: ['Star Power', '0-Cost ASol', 'Turn 1 Win'],
        cost: '70 Aurelion Sol Fragments',
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087-full.png',
        desc: {
          vi: 'Khi bạn đánh một lá bài được tạo ra, giảm 2 năng lượng tiêu hao cho mọi Tướng ở mọi nơi.',
          en: 'When you play a created card, reduce the cost of all Champions everywhere by 2.'
        },
        tip: {
          vi: 'Chỉ cần đánh 5 lá bài được tạo ra là Aurelion Sol 10 Mana giảm thẳng về 0 Mana!',
          en: 'Playing just 5 created cards discounts 10-mana Aurelion Sol all the way to 0 Mana!'
        },
        nodePos: { x: 70, y: 55, connectedTo: ['asol-star-4'] }
      },
      {
        id: 'asol-star-4',
        category: 'STAR_POWERS',
        name: { vi: 'Uy Quyền Tinh Tú Tối Thượng', en: 'Supreme Star Forger (4★ Apex)' },
        inputs: ['4★', '2X STATS'],
        badges: ['4★ Max Apex', 'Double Stats', 'Unstoppable'],
        cost: '100 Aurelion Sol Fragments (Monthly Reward)',
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087T1-full.png',
        desc: {
          vi: 'Khi bạn đánh một đơn vị đồng minh, nếu bạn có nhiều Đá Năng Lượng hơn đối phương hoặc đơn vị đó là bài được tạo ra, NHÂN ĐÔI Sức Mạnh và Máu của nó. Bầu Trời Sụp Đổ tự tạo ra mỗi đầu vòng.',
          en: 'When you play a unit, double its Power and Health. Round Start: Create a fleeting The Skies Descend in hand.'
        },
        tip: {
          vi: 'Aurelion Sol bước xuống sân với chỉ số 22/22 Khiên Phép ngay ở Vòng 1!',
          en: 'Aurelion Sol hits the board as a 22/22 SpellShield titan on Turn 1!'
        },
        nodePos: { x: 90, y: 40, connectedTo: [] }
      },
      {
        id: 'asol-lv-20',
        category: 'LEVEL_UPGRADES',
        name: { vi: 'Cấp 20: Tiếng Gọi Tinh Tú', en: 'Level 20: Behold the Infinite' },
        inputs: ['LV 20', 'DOUBLE CAST'],
        badges: ['Level Upgrade', 'Invoke x2', '0 Mana'],
        cost: 'Champion Level 20',
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT015-full.png',
        desc: {
          vi: 'Chiêm Ngưỡng Vô Cực (Behold the Infinite) nhận Trang Bị giảm 2 Mana (còn 0 Mana) và tạo thêm 1 bản sao trên tay.',
          en: 'Behold the Infinite costs 0 Mana and creates a fleeting copy of itself when cast.'
        },
        tip: {
          vi: 'Một lá bài duy nhất giúp bạn giảm ngay 8 Mana cho toàn bộ Tướng trên tay!',
          en: 'A single card draw that discounts all Champions in your hand by 8 Mana for free!'
        },
        nodePos: { x: 48, y: 78, connectedTo: ['asol-star-3'] }
      }
    ],
    startingDeck: [
      {
        name: { vi: 'Chiêm Ngưỡng Vô Cực (Behold the Infinite)', en: 'Behold the Infinite' },
        cost: 2,
        type: 'Spell // Burst Invoke',
        item: { vi: 'Ngọc Năng Lượng (-2 Mana = 0 Mana)', en: 'Tear of the Goddess (-2 Cost = 0 Mana)' },
        unlockLv: 'Lv 3 & Lv 20',
        keepPriority: { vi: 'ƯU TIÊN SỐ 1 (Giảm ngay 4-8 Mana cho ASol)', en: 'TOP PRIORITY (Discounts ASol by 4-8 Mana)' },
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT015.png'
      },
      {
        name: { vi: 'Sứ Giả Tinh Tú (Spacey Sketcher)', en: 'Spacey Sketcher' },
        cost: 1,
        type: 'Unit // 1/1 Invoke',
        item: { vi: 'Túi Đồ Thám Hiểm (Tự rút đầu trận)', en: 'Farsight Alteration (Draw 1 at Game Start)' },
        unlockLv: 'Lv 9',
        keepPriority: { vi: 'LUÔN GIỮ (Đổi 1 bài lấy Thượng Giới 0 Mana)', en: 'KEEP (Creates 0-cost Celestial to discount ASol)' },
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT086.png'
      },
      {
        name: { vi: 'Rồng Bạch Dương (Whiteflame Protector)', en: 'Whiteflame Protector' },
        cost: 3,
        type: 'Unit // 2/4 Fury',
        item: { vi: 'Giáp Phản Đòn (+1/+3 & Khiên Phép)', en: 'SpellShield & +1/+3' },
        unlockLv: 'Lv 15',
        keepPriority: { vi: 'ĐỔI ĐẦU TRẬN (Tìm bài Invoke 0-1 Mana)', en: 'MULLIGAN AWAY (Look for 0-1 cost Invoke)' },
        img: 'https://dd.b.pvp.net/latest/set5/en_us/img/cards/05MT003.png'
      },
      {
        name: { vi: 'AURELION SOL', en: 'AURELION SOL' },
        cost: 10,
        type: 'Champion // 10/10 Fury SpellShield',
        item: { vi: '3 Ô Cổ Vật Tối Thượng', en: '3 Custom Relic Slots' },
        unlockLv: 'Lv 1 - Lv 30',
        keepPriority: { vi: 'BẮT BUỘC GIỮ (Sẽ giảm về 0 Mana ở Vòng 1)', en: 'MUST KEEP (Drops for 0 Mana on Turn 1)' },
        img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087.png'
      }
    ],
    relicSets: {
      BIS_ENDGAME: {
        id: 'BIS_ENDGAME',
        starReq: '4★ GOD TIER',
        difficulty: { vi: 'CỰC DỄ // 100% THẮNG VÒNG 1', en: 'TRIVIAL // 100% TURN 1 WIN' },
        label: { vi: 'THẦN LONG VÔ CỰC (TURN 1 ASOL)', en: 'TURN 1 STAR FORGER GOD BUILD' },
        winRate: '100%',
        clearTime: '03m 10s',
        summary: {
          vi: 'Tạo bài miễn phí ngay đầu trận bằng Spellweaver\'s Symphony + Starforged Gauntlets để triệu hồi Aurelion Sol 22/22 ngay ở Vòng 1.',
          en: 'Generates free 0-cost spells at Round Start to discount and summon a 22/22 Level 2 Aurelion Sol on Turn 1 every single game.'
        },
        slots: [
          {
            name: { vi: 'Găng Tay Tinh Tú (Starforged Gauntlets)', en: 'Starforged Gauntlets' },
            rarity: 'EPIC',
            icon: '🧤',
            effect: {
              vi: 'Nếu tôi là Titanic (8+ Máu/Công), +1 Đá Năng Lượng Khởi Đầu. Khi Kêu Gọi, luôn có lựa chọn Tướng.',
              en: 'If I\'m Titanic, +1 Starting Mana. When you Invoke, you can choose Champions.'
            },
            synergyNote: {
              vi: 'Cho bạn khởi đầu trận đấu với 4 Mana và biến mọi lá bài Kêu Gọi (Invoke) thành cỗ máy in Tướng miễn phí (mọi Tướng đánh ra đều tự Thăng Cấp nhờ 2★!).',
              en: 'Starts you at 4 Mana and lets every Invoke discover random Champions—which also cost 0 and auto-level on play via his 2★ power!'
            }
          },
          {
            name: { vi: 'Bản Giao Hưởng Phù Thủy (Spellweaver\'s Symphony)', en: 'Spellweaver\'s Symphony' },
            rarity: 'EPIC',
            icon: '🎼',
            effect: {
              vi: 'Khi bạn có Đá Tấn Công, tạo 1 bài phép ngẫu nhiên tốn 2 Mana với giá 0 Mana trên tay.',
              en: 'When you gain the Attack Token, create a random 2-cost spell in hand that costs 0.'
            },
            synergyNote: {
              vi: 'Cho không bạn 1 lá bài Được Tạo Ra tốn 0 Mana ngay khi bắt đầu Vòng 1 -> Đánh ra lập tức giảm 2 Mana cho Aurelion Sol mà không tốn 1 giọt năng lượng nào!',
              en: 'Hands you a free 0-cost Created Spell on Turn 1 -> Casting it immediately discounts Aurelion Sol by 2 Mana for 0 investment!'
            }
          },
          {
            name: { vi: 'Vương Miện Tối Cao (Crownguard Inheritance)', en: 'Crownguard Inheritance' },
            rarity: 'RARE',
            icon: '👑',
            effect: {
              vi: 'Khi tôi Thăng Cấp (kích hoạt ngay khi đánh ASol nhờ 2★!), Chuẩn Bị Tấn Công (Rally).',
              en: 'When I Level Up (triggers immediately on Play via 2★!), Rally.'
            },
            synergyNote: {
              vi: 'Do Sức mạnh 2★ giúp Aurelion Sol tự động Thăng Cấp ngay khi đặt xuống bàn, Crownguard sẽ kích hoạt Chuẩn Bị Tấn Công ngay lập tức bất kể lượt ai!',
              en: 'Because ASol\'s 2★ power levels him up the instant he is played, Crownguard triggers an immediate Rally even on defensive turns!'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Giữ Aurelion Sol, Chiêm Ngưỡng Vô Cực (Behold the Infinite - 0 Mana) và Sứ Giả Tinh Tú (Spacey Sketcher).',
            en: 'Keep Aurelion Sol, Behold the Infinite (0 Mana), and Spacey Sketcher.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'VÒNG 1 // ĐÁNH CHUỖI BÀI 0 MANA ĐƯỢC TẠO RA', en: 'TURN 1 // 0-MANA CREATED SPELL CHAIN' },
              action: {
                vi: 'Đánh lá bài phép 0 Mana từ Spellweaver\'s Symphony + Chiêm Ngưỡng Vô Cực (0 Mana) + bài Kêu Gọi được tạo ra -> Giảm ngay 6-8 Mana cho Aurelion Sol!',
                en: 'Cast your 0-cost Spellweaver spell + 0-cost Behold the Infinite + the Invoked card -> Discounts Aurelion Sol by 6-8 Mana on Turn 1!'
              },
              videoTime: 15,
              timeLabel: '00:15'
            },
            {
              step: '02',
              phase: { vi: 'VÒNG 1 // TRIỆU HỒI AURELION SOL & TỰ THĂNG CẤP', en: 'TURN 1 // SUMMON 22/22 LEVEL 2 ASOL' },
              action: {
                vi: 'Đánh Aurelion Sol (lúc này chỉ tốn 0-4 Mana). Sức mạnh 2★ giúp ASol Thăng Cấp ngay lập tức, 4★ nhân đôi chỉ số lên 22/22 và Crownguard kích hoạt Rally!',
                en: 'Play Aurelion Sol for 0-4 Mana. 2★ flips him to Level 2 immediately, 4★ doubles his stats to 22/22, and Crownguard rallies!'
              },
              videoTime: 50,
              timeLabel: '00:50'
            },
            {
              step: '03',
              phase: { vi: 'VÒNG 1 // RẢI THẢM THƯỢNG GIỚI 0 MANA', en: 'TURN 1 // 0-COST CELESTIAL FLOOD' },
              action: {
                vi: 'Khi Aurelion Sol Cấp 2 ở trên bàn, mọi bài Thượng Giới bạn tạo thêm đều có giá 0 Mana và được nhân đôi chỉ số (40/40) để tấn công dứt điểm ngay Vòng 1!',
                en: 'With Level 2 ASol on board, all newly Invoked Celestials cost 0 Mana and enter with doubled stats to OTK the enemy Nexus!'
              },
              videoTime: 90,
              timeLabel: '01:30'
            }
          ],
          proTips: [
            {
              vi: 'Khi Kêu Gọi (Invoke) bằng Chiêm Ngưỡng Vô Cực ở Vòng 1, hãy luôn ưu tiên chọn các lá bài Thượng Giới tốn 0-2 Mana (như Ngôi Sao Băng hoặc Rắn Tinh Tú) để chuỗi giảm giá diễn ra liên tục trong cùng Vòng 1!',
              en: 'When Invoking on Turn 1, always pick 0-2 cost Celestial cards (like The Charger or Moonglow) so you can play them immediately to continue discounting ASol!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: 'kXYiU_JCYtU',
          title: {
            vi: 'AURELION SOL 4★ Turn 1 OTK vs Thử Thách Hàng Tháng #70 & Lissandra',
            en: '4★ AURELION SOL Turn 1 OTK vs Monthly Challenge #70 & 6.5★ Fiddlesticks'
          },
          bossTag: 'VS MONTHLY CHALLENGE #70',
          duration: '03:05',
          patch: 'GOD TIER META',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Tại sao Spellweaver + Starforged là bộ đôi mạnh nhất', en: 'Why Spellweaver + Starforged is Unbeatable' } },
            { time: 15, label: '00:15', title: { vi: 'Bước 1: Chuỗi Kêu Gọi 0 Mana giảm giá ASol', en: 'Step 1: 0-Mana Invoke Discount Chain' } },
            { time: 50, label: '00:50', title: { vi: 'Bước 2: Hạ Aurelion Sol 22/22 ngay Vòng 1', en: 'Step 2: Turn 1 22/22 Aurelion Sol Drop' } },
            { time: 90, label: '01:30', title: { vi: 'Bước 3: Quét sạch bàn bằng Bầu Trời Sụp Đổ 0 Mana', en: 'Step 3: 0-Cost Skies Descend Board Wipe' } }
          ]
        }
      },

      SPEEDRUN: {
        id: 'SPEEDRUN',
        starReq: '3★ - 4★ BOARD WIPE',
        difficulty: { vi: 'DỄ // QUÉT SẠCH BÀN ĐẤU', en: 'EASY // INSTANT BOARD WIPE' },
        label: { vi: 'BẦU TRỜI SỤP ĐỔ 0 MANA (DECEIVER\'S CREST)', en: '0-COST SKIES DESCEND (DECEIVER\'S CREST)' },
        winRate: '99.9%',
        clearTime: '03m 45s',
        summary: {
          vi: 'Tận dụng việc Aurelion Sol thăng cấp ngay khi đánh ra để kích hoạt Deceiver\'s Crest, tạo ngay siêu phép Bầu Trời Sụp Đổ (15 sát thương toàn bàn) với giá 0 Mana!',
          en: 'Exploits ASol\'s instant level-up on play to trigger Deceiver\'s Crest, generating a 0-cost The Skies Descend (15 AoE damage to all enemies) immediately!'
        },
        slots: [
          {
            name: { vi: 'Găng Tay Tinh Tú (Starforged Gauntlets)', en: 'Starforged Gauntlets' },
            rarity: 'EPIC',
            icon: '🧤',
            effect: {
              vi: '+1 Đá Năng Lượng Khởi Đầu cho đơn vị Titanic.',
              en: '+1 Starting Mana for Titanic Champion.'
            },
            synergyNote: {
              vi: 'Tăng tốc độ ra sân của Aurelion Sol và mở khóa việc Kêu Gọi Tướng.',
              en: 'Accelerates ASol\'s entry and unlocks Champion Invokes.'
            }
          },
          {
            name: { vi: 'Huy Hiệu Kẻ Lừa Gạt (Deceiver\'s Crest)', en: 'Deceiver\'s Crest' },
            rarity: 'RARE',
            icon: '🎭',
            effect: {
              vi: 'Khi tôi Thăng Cấp, tạo 1 bài Phép Tướng tốn 0 Mana trên tay.',
              en: 'When I Level Up, create a 0-cost Champion Spell in hand.'
            },
            synergyNote: {
              vi: 'Phép Tướng của Aurelion Sol là "Bầu Trời Sụp Đổ" vốn tốn 15 Mana! Nhờ Deceiver\'s Crest, ngay khi đánh ASol bạn nhận ngay lá phép này với giá 0 Mana để gây 15 sát thương quét sạch toàn bộ bàn địch!',
              en: 'ASol\'s Champion Spell is the 15-mana "The Skies Descend"! Deceiver\'s Crest hands it to you for 0 Mana on play, dealing 15 damage to all enemies AND discounting other Champions by 2!'
            }
          },
          {
            name: { vi: 'Vương Miện Tối Cao (Crownguard Inheritance)', en: 'Crownguard Inheritance' },
            rarity: 'RARE',
            icon: '👑',
            effect: {
              vi: 'Chuẩn bị Tấn Công ngay khi đánh Aurelion Sol.',
              en: 'Rally immediately when Aurelion Sol is played.'
            },
            synergyNote: {
              vi: 'Sau khi dùng Bầu Trời Sụp Đổ 0 Mana quét sạch toàn bộ quân cản đường của địch, bạn tấn công trực diện vào Nhà Chính trống trải!',
              en: 'After wiping all enemy blockers with your 0-cost Skies Descend, Crownguard lets you swing straight into an open Nexus!'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Giữ Aurelion Sol và mọi lá bài tạo bài rẻ (Spacey Sketcher, Behold the Infinite).',
            en: 'Keep Aurelion Sol and all low-cost card generators (Spacey Sketcher, Behold the Infinite).'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'BƯỚC 1 // KÊU GỌI & GIẢM GIÁ TƯỚNG', en: 'STEP 1 // INVOKE & DISCOUNT' },
              action: {
                vi: 'Đánh 3-4 lá bài được tạo ra ở Vòng 1-2 để giảm giá Aurelion Sol xuống dưới 4 Mana.',
                en: 'Play 3-4 created cards across Turns 1-2 to discount Aurelion Sol to 4 Mana or less.'
              },
              videoTime: 20,
              timeLabel: '00:20'
            },
            {
              step: '02',
              phase: { vi: 'BƯỚC 2 // KÍCH HOẠT DECEIVER\'S CREST', en: 'STEP 2 // TRIGGER DECEIVER\'S CREST' },
              action: {
                vi: 'Triệu hồi Aurelion Sol -> Tự động Thăng Cấp -> Nhận ngay "Bầu Trời Sụp Đổ" giá 0 Mana trên tay!',
                en: 'Summon Aurelion Sol -> Instant Level Up -> Receive a 0-cost "The Skies Descend" in hand!'
              },
              videoTime: 62,
              timeLabel: '01:02'
            },
            {
              step: '03',
              phase: { vi: 'BƯỚC 3 // HỦY DIỆT BÀN ĐẤU & TẤN CÔNG', en: 'STEP 3 // 15-DAMAGE AOE WIPE & RALLY' },
              action: {
                vi: 'Đánh Bầu Trời Sụp Đổ 0 Mana quét sạch toàn bộ bàn đấu của Boss, sau đó kéo toàn bộ Rồng tấn công bằng Đá Tấn Công từ Crownguard!',
                en: 'Cast 0-cost The Skies Descend to obliterate the enemy board, then swing for lethal with Crownguard Rally!'
              },
              videoTime: 105,
              timeLabel: '01:45'
            }
          ],
          proTips: [
            {
              vi: 'Bầu Trời Sụp Đổ do Deceiver\'s Crest tạo ra cũng được tính là 1 "Lá Bài Được Tạo Ra" (Created Card) -> Khi đánh nó ra, mọi Tướng Hỗ Trợ trên tay bạn lại tiếp tục được giảm thêm 2 Mana!',
              en: 'The Skies Descend created by Deceiver\'s Crest also counts as a Created Card -> Casting it for 0 Mana discounts any Support Champions in your hand by another 2 Mana!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: 'fJ9rUzIMcZQ',
          title: {
            vi: 'AURELION SOL Deceiver\'s Crest (Bầu Trời Sụp Đổ 0 Mana) vs 6.5★ Viego',
            en: 'AURELION SOL Deceiver\'s Crest (0-Cost Skies Descend) vs 6.5★ Nightmare'
          },
          bossTag: 'VS 6.5★ NIGHTMARE ADVENTURE',
          duration: '02:30',
          patch: 'BOARD WIPE BUILD',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Tương tác giữa 2★ ASol và Deceiver\'s Crest', en: '2★ ASol + Deceiver\'s Crest Synergy' } },
            { time: 20, label: '00:20', title: { vi: 'Bước 1: Chuỗi giảm năng lượng đầu trận', en: 'Step 1: Early Invoke Discounts' } },
            { time: 62, label: '01:02', title: { vi: 'Bước 2: Triệu hồi ASol nhận Bầu Trời Sụp Đổ 0 Mana', en: 'Step 2: 0-Mana Skies Descend Generation' } },
            { time: 105, label: '01:45', title: { vi: 'Bước 3: Quét sạch bàn 15 sát thương & Rally', en: 'Step 3: 15-Damage Board Wipe & Rally' } }
          ]
        }
      },

      F2P_RARE: {
        id: 'F2P_RARE',
        starReq: '2★ - 3★ F2P RARE',
        difficulty: { vi: 'DỄ // KHÔNG CẦN EPIC', en: 'EASY // ZERO EPICS' },
        label: { vi: 'KHÔNG CẦN EPIC RELIC (F2P)', en: 'F2P RARE ONLY LOADOUT' },
        winRate: '99.2%',
        clearTime: '04m 30s',
        summary: {
          vi: 'Sử dụng bộ 3 Cổ Vật Rare dễ kiếm để đảm bảo hạ gục mọi Boss ngay khi Aurelion Sol chạm bàn.',
          en: 'Uses 100% accessible Rare relics to guarantee an instant board wipe and Rally the moment Aurelion Sol hits the board.'
        },
        slots: [
          {
            name: { vi: 'Trượng Thiên Thần (Archangel\'s Staff)', en: 'Archangel\'s Staff' },
            rarity: 'RARE',
            icon: '🦯',
            effect: {
              vi: 'Bắt đầu vòng: Hồi đầy Năng Lượng Phép của bạn.',
              en: 'Round Start: Refill your Spell Mana.'
            },
            synergyNote: {
              vi: 'Cung cấp nguồn năng lượng dồi dào để đánh liên tục các phép Kêu Gọi (Invoke).',
              en: 'Provides endless Spell Mana to chain Invoke spells.'
            }
          },
          {
            name: { vi: 'Vương Miện Tối Cao (Crownguard Inheritance)', en: 'Crownguard Inheritance' },
            rarity: 'RARE',
            icon: '👑',
            effect: {
              vi: 'Khi tôi Thăng Cấp, Chuẩn Bị Tấn Công.',
              en: 'When I Level Up, Rally.'
            },
            synergyNote: {
              vi: 'Giúp bạn tấn công ngay lập tức ở lượt đánh Aurelion Sol.',
              en: 'Gives you an immediate attack token on the turn ASol is played.'
            }
          },
          {
            name: { vi: 'Huy Hiệu Kẻ Lừa Gạt (Deceiver\'s Crest)', en: 'Deceiver\'s Crest' },
            rarity: 'RARE',
            icon: '🎭',
            effect: {
              vi: 'Tạo Bầu Trời Sụp Đổ 0 Mana quét sạch bàn địch.',
              en: 'Creates a 0-cost The Skies Descend on play.'
            },
            synergyNote: {
              vi: 'Dọn sạch mọi kẻ địch cản đường trước khi kích hoạt đòn tấn công từ Crownguard.',
              en: 'Clears all blockers before your Crownguard Rally swing.'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Ưu tiên giữ Tướng Hỗ Trợ rẻ tiền (2-3 Mana) cùng các lá bài tạo bài trên tay.',
            en: 'Prioritize keeping your low-cost Support Champion alongside Invoke cards.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'VÒNG 1 // ĐÁNH TƯỚNG HỖ TRỢ MIỄN PHÍ', en: 'TURN 1 // FREE SUPPORT CHAMPION' },
              action: {
                vi: 'Đánh 1-2 lá bài tạo ra để giảm giá Tướng Hỗ Trợ về 0 Mana. Đánh Tướng Hỗ Trợ ra bàn (tự động Thăng Cấp nhờ 2★!).',
                en: 'Play 1-2 created cards to discount your Support Champion to 0 Mana, then drop them as an instant Level 2 unit!'
              },
              videoTime: 15,
              timeLabel: '00:15'
            },
            {
              step: '02',
              phase: { vi: 'VÒNG 2 // HẠ AURELION SOL KẾT LIỄU', en: 'TURN 2 // SUMMON ASOL & FINISH' },
              action: {
                vi: 'Triệu hồi Aurelion Sol, ném Bầu Trời Sụp Đổ 0 Mana và kết thúc trận đấu.',
                en: 'Summon Aurelion Sol, cast 0-cost Skies Descend, and attack for game.'
              },
              videoTime: 55,
              timeLabel: '00:55'
            }
          ],
          proTips: [
            {
              vi: 'Ngay cả khi bạn chưa mở được Aurelion Sol lên 4★, chỉ cần ở mức 2★-3★ với bộ cổ vật F2P này là bạn đã có thể thắng 100% các tầng khó nhất trong Thử Thách Hàng Tháng!',
              en: 'Even at 2★ or 3★ without a single Epic relic, this loadout beats every single Boss stage in Monthly Challenges!'
            }
          ]
        },
        videoShowcase: null,
        fallbackVideoShowcase: {
          youtubeId: 'kXYiU_JCYtU',
          title: {
            vi: 'AURELION SOL 3★ F2P (Không Cần Epic Relic) Càn Quét Thử Thách Tháng',
            en: '3★ F2P AURELION SOL (No Epics) Monthly Challenge Boss Rush'
          },
          bossTag: 'F2P MONTHLY CLEAR',
          duration: '03:20',
          patch: 'RARE RELICS ONLY',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Cách phối 3 Cổ Vật Rare cho ASol', en: '3x Rare Relic Setup Overview' } },
            { time: 15, label: '00:15', title: { vi: 'Vòng 1: Thả Tướng Hỗ Trợ 0 Mana tự Thăng Cấp', en: 'Turn 1: 0-Mana Auto-Leveled Support Champ' } },
            { time: 55, label: '00:55', title: { vi: 'Vòng 2: Bầu Trời Sụp Đổ + Rally dứt điểm', en: 'Turn 2: Skies Descend + Rally Lethal' } }
          ]
        }
      }
    },
    recommendations: {
      powers: [
        { name: { vi: 'Nhanh Trí (Quick Draw)', en: 'Quick Draw' }, rarity: 'RARE', desc: { vi: 'Bài rút hoặc tạo ra giảm thêm 1 năng lượng.', en: 'Generated/drawn cards cost 1 less.' } },
        { name: { vi: 'Dòng Chảy Hoàn Hảo (Perfected Manaflow)', en: 'Perfected Manaflow' }, rarity: 'EPIC', desc: { vi: '+1 Đá Năng Lượng mỗi vòng.', en: 'Gain an extra Mana Gem each round.' } }
      ],
      items: [
        { name: { vi: 'Viên Đá Tri Thức (Oracle\'s Lens)', en: 'Oracle\'s Lens' }, rarity: 'COMMON', desc: { vi: 'Rút 1 lá bài hoặc tạo thêm bài.', en: 'Draw 1 / generate extra cards.' } },
        { name: { vi: 'Dây Chuyền Thanh Tẩy (Shadow Totem)', en: 'Shadow Totem' }, rarity: 'RARE', desc: { vi: 'Tạo bản sao cho các đơn vị Kêu Gọi.', en: 'Duplicates Invoked units.' } }
      ],
      supportChamps: [
        { name: 'Katarina', region: 'Noxus', synergy: 'GOD Tier // Đánh ra tự Thăng Cấp & Rally vô hạn 0 Mana' },
        { name: 'Zoe', region: 'Targon', synergy: 'S+ Tier // Tạo bài Thượng Giới 1 Mana ngay Vòng 1' },
        { name: 'Aphelios', region: 'Targon', synergy: 'S Tier // Tạo Vũ Khí Cung Trăng liên hoàn' }
      ]
    },
    communityRatings: [
      {
        user: 'CelestialDragon_VN',
        stars: '4★',
        rating: 10,
        loadoutUsed: 'TURN 1 STAR FORGER GOD BUILD',
        comment: {
          vi: 'Tướng mạnh nhất lịch sử Path of Champions. Bắt được Katarina làm tướng phụ là Rally vô hạn ngay từ Vòng 1!',
          en: 'The strongest champion in PoC history. Drafting Katarina as a support champion means infinite 0-mana Rallies on Turn 1!'
        }
      }
    ]
  },

  yasuo: {
    id: 'yasuo',
    code: '01IO015',
    name: 'YASUO',
    title: {
      vi: 'Kẻ Bất Dung Thứ',
      en: 'The Unforgiven'
    },
    region: {
      vi: 'Ionia',
      en: 'Ionia'
    },
    regionCode: 'IO',
    maxStars: 6,
    cost: 4,
    attack: 4,
    health: 4,
    levelUpAttack: 5,
    levelUpHealth: 5,
    keywords: ['Quick Attack'],
    tier: 'S',
    accentColor: '#A855F7', // Tempest Violet
    secondaryColor: '#D2FF28', // Tactical Lime
    splashLv1: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015-full.png',
    splashLv2: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015T1-full.png',
    cardLv1: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015.png',
    cardLv2: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015T1.png',
    champSpell: {
      name: { vi: 'Bão Thép (Steel Tempest)', en: 'Steel Tempest' },
      cost: 2,
      desc: {
        vi: 'Làm Choáng 1 kẻ địch đang tấn công. Rút 1 lá bài nếu đã nâng cấp cấp độ Tướng.',
        en: 'Stun an attacking enemy. Draw 1 with PoC Level item.'
      }
    },
    loreQuote: {
      vi: 'Lưỡi kiếm gió không cho bất kỳ kẻ địch nào cơ hội chạm vào Nhà Chính! Với Sức Mạnh làm choáng tự động mỗi vòng và Chòm Sao 6 Sao triệu hồi lốc xoáy thu hồi toàn bộ bàn địch, Yasuo là pháo đài kiểm soát tuyệt đối.',
      en: 'A tempest blade that never lets an enemy touch your Nexus! With automatic Round Start stuns and a 6-Star Constellation that recalls stunned enemies while scaling infinitely, Yasuo is the ultimate control duelist.'
    },
    bioGrid: {
      archetype: {
        vi: 'Làm Choáng / Kiểm Soát Nhịp Độ (Stun & Recall Control)',
        en: 'Stun & Recall Tempo Control'
      },
      speed: {
        vi: 'S Tier // Khắc Tinh Của Mọi Map Boss Sát Thương Cao',
        en: 'S Tier // Ultimate Anti-Aggro Boss Counter'
      },
      strengths: {
        vi: 'Khóa cứng kẻ địch mạnh nhất mỗi vòng, chém sạch bàn khi Thăng Cấp',
        en: 'Locks down strongest attacker every round, board-wipes with Tempest Blade'
      },
      weaknesses: {
        vi: 'Phụ thuộc vào việc rút được Yasuo đúng nhịp độ',
        en: 'Reliant on drawing Yasuo on curve without tutor relics'
      }
    },
    stats: {
      damage: 8,
      defense: 10,
      speed: 8,
      consistency: 9,
      synergy: 9,
      independence: 8
    },
    passiveTrait: {
      name: {
        vi: 'Cơ Chế Cốt Lõi: Tuyệt Kỹ Trăn Trối (Last Breath)',
        en: 'Core Engine: Way of the Wanderer'
      },
      desc: {
        vi: 'Mỗi khi một kẻ địch bị Làm Choáng hoặc Thu Hồi, Yasuo lập tức chém nó và được cộng vĩnh viễn +1/+0. Khi kết hợp Cổ Vật "Tempest Blade", khoảnh khắc Yasuo thăng cấp sẽ làm choáng toàn bộ bàn địch và chém chết tất cả cùng lúc!',
        en: 'Every time an enemy is Stunned or Recalled, Yasuo strikes it and permanently gains +1/+0. Paired with "Tempest Blade", leveling up Yasuo stuns the entire enemy board and slices every single enemy to pieces!'
      }
    },
    moves: [
      {
        id: 'yasuo-star-1',
        category: 'STAR_POWERS',
        name: { vi: 'Đạo Của Phong Kiếm I', en: 'Way of the Wanderer I' },
        inputs: ['1★', 'AUTO STUN'],
        badges: ['Star Power', 'Round Start', 'Defense'],
        cost: '30 Yasuo Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015-full.png',
        desc: {
          vi: 'Khi đối phương có Đá Tấn Công: Làm Choáng kẻ địch mạnh nhất.',
          en: 'When the foe gains the Attack Token: Stun the strongest enemy.'
        },
        tip: {
          vi: 'Tự động cộng tiến trình thăng cấp cho Yasuo ngay cả khi anh ta còn nằm trong bộ bài.',
          en: 'Automatically progresses Yasuo\'s level-up counter even while he is still in your deck!'
        },
        nodePos: { x: 20, y: 50, connectedTo: ['yasuo-star-2'] }
      },
      {
        id: 'yasuo-star-2',
        category: 'STAR_POWERS',
        name: { vi: 'Ý Chí Lãng Khách', en: 'Unforgiven Resolve' },
        inputs: ['2★', 'SCALING +1/+0'],
        badges: ['Star Power', '+1 Mana', 'Permanent Buff'],
        cost: '20 Yasuo Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015T1-full.png',
        desc: {
          vi: '+1 Đá Năng Lượng Khởi Đầu. Khi bạn Làm Choáng hoặc Thu Hồi 1 kẻ địch, ban cho đồng minh ra đòn vào nó +1/+0.',
          en: '+1 Starting Mana. When you Stun or Recall an enemy, grant allies that strike it +1/+0.'
        },
        tip: {
          vi: 'Giúp sức tấn công của Yasuo tăng vọt lên 15-20 sát thương chỉ sau một pha Bão Kiếm.',
          en: 'Scales Yasuo\'s attack to 15-20+ after a single Tempest Blade board stun.'
        },
        nodePos: { x: 45, y: 30, connectedTo: ['yasuo-star-3'] }
      },
      {
        id: 'yasuo-star-3',
        category: 'STAR_POWERS',
        name: { vi: 'Đạo Của Phong Kiếm II', en: 'Way of the Wanderer II' },
        inputs: ['3★', 'EVERY ROUND STUN'],
        badges: ['Star Power', 'Every Round', 'Hard Lock'],
        cost: '40 Yasuo Fragments',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015-full.png',
        desc: {
          vi: 'Khi Bắt Đầu MỌI Vòng Đấu: Làm Choáng kẻ địch mạnh nhất.',
          en: 'Round Start (Every Round): Stun the strongest enemy.'
        },
        tip: {
          vi: 'Làm choáng cả ở lượt tấn công của bạn lẫn lượt phòng thủ, vô hiệu hóa hoàn toàn Boss đối phương.',
          en: 'Stuns on both your attack turns and defense turns, permanently locking down enemy bosses.'
        },
        nodePos: { x: 68, y: 55, connectedTo: ['yasuo-star-6'] }
      },
      {
        id: 'yasuo-star-6',
        category: 'STAR_POWERS',
        name: { vi: 'Cuồng Phong Tuyệt Diệt (6★ Apex)', en: 'Eye of the Hurricane (6★ Apex)' },
        inputs: ['6★', 'NOVA', 'STUN -> RECALL'],
        badges: ['6★ Legendary', 'Recall Engine', 'Board Clear'],
        cost: '100 Fragments + 1 Ionia Nova Crystal',
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015T1-full.png',
        desc: {
          vi: 'Khi một kẻ địch bị Làm Choáng mà vẫn sống sót sau nhát chém của đồng minh, THU HỒI nó về tay đối phương và giảm 1 tiêu hao cho toàn bộ bài trên tay bạn.',
          en: 'When a Stunned enemy survives an ally strike, RECALL it and reduce the cost of cards in your hand by 1.'
        },
        tip: {
          vi: 'Khắc phục hoàn toàn nhược điểm gặp quái 50-100 máu ở map Ác Mộng 6.5 Sao!',
          en: 'Completely solves 50-100 HP Nightmare units—if Yasuo\'s strike doesn\'t kill them, they get Recalled AND trigger a second strike!'
        },
        nodePos: { x: 88, y: 40, connectedTo: [] }
      }
    ],
    startingDeck: [
      {
        name: { vi: 'Kiếm Khách Fae (Fae Bladetwirler)', en: 'Fae Bladetwirler' },
        cost: 2,
        type: 'Unit // 1/3 Quick Attack',
        item: { vi: 'Khiên Cổ Đại (+2/+2)', en: 'Phage (+2/+2)' },
        unlockLv: 'Lv 6',
        keepPriority: { vi: 'BẮT BUỘC GIỮ (Tăng +2/+0 mỗi lần Làm Choáng)', en: 'MUST KEEP (Scales +2/+0 on every Stun)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO008.png'
      },
      {
        name: { vi: 'Bão Thép (Steel Tempest)', en: 'Steel Tempest' },
        cost: 2,
        type: 'Spell // Fast Stun',
        item: { vi: 'Viên Đá Tri Thức (Rút 1 lá bài)', en: 'Oracle\'s Lens (Draw 1)' },
        unlockLv: 'Lv 9',
        keepPriority: { vi: 'GIỮ LẠI (Vừa Làm Choáng vừa Rút thêm bài)', en: 'KEEP (Stuns attacker + Draws 1 card)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO046.png'
      },
      {
        name: { vi: 'YASUO', en: 'YASUO' },
        cost: 4,
        type: 'Champion // 4/4 Quick Attack',
        item: { vi: '3 Ô Cổ Vật Tùy Chỉnh', en: '3 Custom Relic Slots' },
        unlockLv: 'Lv 1 - Lv 30',
        keepPriority: { vi: 'ƯU TIÊN SỐ 1 (Trụ cột quét bàn đấu)', en: 'TOP PRIORITY (Core Board-Wipe Engine)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015.png'
      },
      {
        name: { vi: 'Chưởng Quản Yone (Yone, Windchaser)', en: 'Yone, Windchaser' },
        cost: 7,
        type: 'Unit // 6/6 Double Stun',
        item: { vi: 'Ngọc Lục Bảo (-2 Năng Lượng)', en: 'Nomad\'s Medallion (-2 Cost)' },
        unlockLv: 'Lv 18',
        keepPriority: { vi: 'ĐỔI ĐẦU TRẬN (Giữ nếu đánh với Boss nhiều quái to)', en: 'MULLIGAN EARLY (Great mid-game double stun)' },
        img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO056.png'
      }
    ],
    relicSets: {
      BIS_ENDGAME: {
        id: 'BIS_ENDGAME',
        starReq: '6★ OPTIMAL',
        difficulty: { vi: 'DỄ // KHÓA CỨNG BÀN ĐẤU', en: 'EASY // TOTAL BOARD LOCK' },
        label: { vi: 'PHONG KIẾM TUYỆT ĐỐI (6★ NIGHTMARE)', en: '6★ TEMPEST SOVEREIGN' },
        winRate: '99.1%',
        clearTime: '04m 50s',
        summary: {
          vi: 'Kết hợp Phong Vũ Kiếm (Yasuo\'s Windblade), Tempest Blade và Crownguard Inheritance để làm choáng toàn bộ bàn địch 2 lần liên tiếp ngay khi triệu hồi!',
          en: 'Combines Yasuo\'s Windblade, Tempest Blade, and Crownguard Inheritance for back-to-back full-board stuns, recalls, and an open Nexus Rally.'
        },
        slots: [
          {
            name: { vi: 'Phong Vũ Kiếm (Yasuo\'s Windblade)', en: 'Yasuo\'s Windblade' },
            rarity: 'EPIC',
            icon: '⚔️',
            effect: {
              vi: '+1 Đá Năng Lượng nếu là Yasuo. Khi triệu hồi tôi, Làm Choáng toàn bộ kẻ địch!',
              en: '+1 Starting Mana if I\'m Yasuo. When I\'m summoned, Stun all enemies!'
            },
            synergyNote: {
              vi: 'Ngay khi đặt Yasuo xuống bàn, toàn bộ kẻ địch bị Làm Choáng -> Cộng ngay 4-6 điểm tiến trình giúp Yasuo Thăng Cấp ngay tại chỗ và kích hoạt tiếp Tempest Blade!',
              en: 'Summoning Yasuo stuns the entire enemy board -> Instantly fulfills his level-up requirement and chains directly into Tempest Blade!'
            }
          },
          {
            name: { vi: 'Kiếm Bão Tố (Tempest Blade)', en: 'Tempest Blade' },
            rarity: 'RARE',
            icon: '🌪️',
            effect: {
              vi: 'Khi tôi Thăng Cấp, Làm Choáng toàn bộ kẻ địch (Kích hoạt chém toàn bàn lần 2!).',
              en: 'When I Level Up, Stun all enemies (Triggers a second full-board slash!).'
            },
            synergyNote: {
              vi: 'Kích hoạt chuỗi chém liên hoàn thứ 2 lên toàn bộ bàn địch. Với Chòm Sao 6★, bất kỳ kẻ địch nào còn sống sẽ bị Thu Hồi về tay và ăn thêm nhát chém thứ 3!',
              en: 'Triggers a second board-wide slash. With 6★ unlocked, any surviving enemy is Recalled and struck a third time!'
            }
          },
          {
            name: { vi: 'Vương Miện Tối Cao (Crownguard Inheritance)', en: 'Crownguard Inheritance' },
            rarity: 'RARE',
            icon: '👑',
            effect: {
              vi: 'Khi tôi Thăng Cấp, Chuẩn Bị Tấn Công vào bàn địch đang bị Làm Choáng hết.',
              en: 'When I Level Up, Rally into a completely stunned enemy board.'
            },
            synergyNote: {
              vi: 'Sau 2 lần Bão Kiếm quét sạch hoặc làm choáng toàn bộ bàn địch, Yasuo (lúc này đã tăng lên 20+ Sức Mạnh) được Chuẩn Bị Tấn Công thẳng vào Nhà Chính!',
              en: 'Once the enemy board is completely stunned or recalled, Crownguard gives your 20+ Attack Yasuo a free Rally swing!'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Tìm Yasuo và Kiếm Khách Fae (Fae Bladetwirler) bằng mọi giá! Nếu đã có Yasuo, giữ thêm Bão Thép (Steel Tempest).',
            en: 'Hard mulligan for Yasuo and Fae Bladetwirler! Keep Steel Tempest if Yasuo is already in hand.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'VÒNG 1 // THẢ KIẾM KHÁCH FAE TÍCH CHỈ SỐ', en: 'TURN 1 // DROP FAE BLADETWIRLER' },
              action: {
                vi: 'Sức mạnh 3★ tự động Làm Choáng kẻ địch mạnh nhất đầu vòng. Triệu hồi Kiếm Khách Fae để cô nàng tự tăng +2/+0 mỗi vòng.',
                en: 'Your 3★ power auto-stuns the strongest enemy at Round Start. Summon Fae Bladetwirler to start scaling her attack.'
              },
              videoTime: 14,
              timeLabel: '00:14'
            },
            {
              step: '02',
              phase: { vi: 'VÒNG 2 // HẠ YASUO KÍCH HOẠT BÃO KIẾM KÉP', en: 'TURN 2 // DOUBLE FULL-BOARD STUN SLASH' },
              action: {
                vi: 'Triệu hồi Yasuo. Phong Vũ Kiếm làm choáng toàn bàn -> Yasuo chém tất cả và Thăng Cấp -> Tempest Blade làm choáng toàn bàn lần 2 -> Chém sạch và Thu Hồi mọi quái to nhờ 6★!',
                en: 'Summon Yasuo. Windblade stuns all enemies -> Yasuo slashes them and levels up -> Tempest Blade stuns all enemies again -> 6★ recalls any survivors!'
              },
              videoTime: 58,
              timeLabel: '00:58'
            },
            {
              step: '03',
              phase: { vi: 'VÒNG 2 // CHUẨN BỊ TẤN CÔNG KẾT LIỄU', en: 'TURN 2 // OPEN NEXUS RALLY LETHAL' },
              action: {
                vi: 'Nhận Đá Tấn Công từ Crownguard Inheritance, kéo Yasuo 25+ Sức Mạnh và Kiếm Khách Fae 20+ Sức Mạnh đâm thẳng vào Nhà Chính không còn ai phòng thủ!',
                en: 'Use the Crownguard Rally token to swing with a 25+ Attack Yasuo and 20+ Attack Fae Bladetwirler into a wide-open Nexus!'
              },
              videoTime: 102,
              timeLabel: '01:42'
            }
          ],
          proTips: [
            {
              vi: 'Mẹo canh tiến trình Thăng Cấp (4/5): Nếu bạn chưa có Phong Vũ Kiếm (Epic), hãy đợi tiến trình của Yasuo đạt 4/5 rồi mới đặt Yasuo (kèm Everfrost) xuống sân để anh ta tự làm choáng đứa thứ 5 và nổ Tempest Blade ngay lập tức!',
              en: '4/5 Level-Up Timing: If you don\'t own Yasuo\'s Windblade yet, wait until Yasuo is at 4/5 progress before dropping him with Everfrost so he immediately triggers Tempest Blade on summon!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: '3JZ_D3ELwOQ',
          title: {
            vi: 'YASUO 6★ Phong Vũ Kiếm + Tempest Blade Quét Sạch Ác Mộng 6.5★',
            en: '6★ YASUO Windblade + Tempest Blade Full Board Wipe vs 6.5★ Nightmare'
          },
          bossTag: 'VS 6.5★ NIGHTMARE BOSS',
          duration: '02:55',
          patch: '6★ IONIA NOVA',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Giải thích cơ chế Chém + Thu Hồi của Yasuo 6★', en: 'How 6★ Stun-to-Recall Engine Works' } },
            { time: 14, label: '00:14', title: { vi: 'Bước 1: Khóa nhịp độ Vòng 1 cùng Fae Bladetwirler', en: 'Step 1: Turn 1 Auto-Stun & Fae Setup' } },
            { time: 58, label: '00:58', title: { vi: 'Bước 2: Combo Phong Vũ Kiếm + Tempest Blade chém 10 nhát', en: 'Step 2: Double Board Stun 10x Slash Combo' } },
            { time: 102, label: '01:42', title: { vi: 'Bước 3: Crownguard Rally kết liễu Nhà Chính', en: 'Step 3: Crownguard Rally Open Attack' } }
          ]
        }
      },

      SPEEDRUN: {
        id: 'SPEEDRUN',
        starReq: '3★ - 6★ OVERWHELM',
        difficulty: { vi: 'DỄ // ĐÂM XUYÊN PHÒNG THỦ', en: 'EASY // PIERCE BLOCKERS' },
        label: { vi: 'TỐC ĐỘ CHÉM LAN (THE BEAST WITHIN)', en: 'OVERWHELM LETHAL SLASH' },
        winRate: '98.0%',
        clearTime: '03m 55s',
        summary: {
          vi: 'Dùng The Beast Within để trao Áp Đảo (Overwhelm) cho toàn bộ đội hình, biến sức tấn công khổng lồ của Yasuo và Fae Bladetwirler thành sát thương xuyên táo!',
          en: 'Uses The Beast Within to grant Overwhelm to your entire board, converting Yasuo and Fae Bladetwirler\'s massive scaled attack into unstoppable Nexus damage.'
        },
        slots: [
          {
            name: { vi: 'Kiếm Bão Tố (Tempest Blade)', en: 'Tempest Blade' },
            rarity: 'RARE',
            icon: '🌪️',
            effect: {
              vi: 'Làm choáng toàn bộ kẻ địch khi Thăng Cấp.',
              en: 'Stun all enemies when I Level Up.'
            },
            synergyNote: {
              vi: 'Vô hiệu hóa toàn bộ hàng phòng thủ đối phương ngay khi Yasuo thăng cấp.',
              en: 'Removes all enemy blockers from combat the moment Yasuo levels up.'
            }
          },
          {
            name: { vi: 'Bản Năng Quái Thú (The Beast Within)', en: 'The Beast Within' },
            rarity: 'EPIC',
            icon: '🐾',
            effect: {
              vi: 'Mọi đồng minh nhận Áp Đảo (Overwhelm) và +1/+1 nếu có nhóm tộc.',
              en: 'Allies have Overwhelm and +1/+1.'
            },
            synergyNote: {
              vi: 'Khiến Fae Bladetwirler (thường đạt 25/5 rất nhanh) đâm xuyên qua mọi quân bài chump-block của đối phương!',
              en: 'Ensures your 25+ Attack Fae Bladetwirler pierces right through 1/1 chump blockers!'
            }
          },
          {
            name: { vi: 'Băng Giá Vĩnh Cửu (Everfrost)', en: 'Everfrost' },
            rarity: 'COMMON',
            icon: '❄️',
            effect: {
              vi: 'Khi triệu hồi tôi, Làm Choáng kẻ địch mạnh nhất.',
              en: 'When I\'m summoned, Stun the strongest enemy.'
            },
            synergyNote: {
              vi: 'Giúp Yasuo vừa bước xuống sân đã tự kích hoạt 1 nhát chém và đẩy nhanh tiến trình Thăng Cấp.',
              en: 'Guarantees an immediate Stun + Strike on summon to trigger level-up.'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Ưu tiên giữ 2 bản sao của Kiếm Khách Fae (Fae Bladetwirler) và Yasuo.',
            en: 'Prioritize keeping Fae Bladetwirler and Yasuo.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'BƯỚC 1 // NUÔI KIẾM KHÁCH FAE ÁP ĐẢO', en: 'STEP 1 // SCALE OVERWHELM BLADETWIRLER' },
              action: {
                vi: 'Đặt Kiếm Khách Fae ra sân ở Vòng 1. Nhờ Beast Within, cô nàng có sẵn Áp Đảo và tăng +2/+0 mỗi khi bạn Làm Choáng.',
                en: 'Drop Fae Bladetwirler on Turn 1. With Beast Within, she has Overwhelm and gains +2/+0 on every Stun.'
              },
              videoTime: 15,
              timeLabel: '00:15'
            },
            {
              step: '02',
              phase: { vi: 'BƯỚC 2 // HẠ YASUO + EVERFROST', en: 'STEP 2 // SUMMON YASUO + EVERFROST' },
              action: {
                vi: 'Triệu hồi Yasuo khi tiến trình đạt 4/5 -> Everfrost làm choáng mục tiêu thứ 5 -> Kích hoạt Tempest Blade làm choáng toàn bàn!',
                en: 'Summon Yasuo at 4/5 progress -> Everfrost stuns the 5th target -> Tempest Blade stuns the entire enemy board!'
              },
              videoTime: 60,
              timeLabel: '01:00'
            }
          ],
          proTips: [
            {
              vi: 'Ngay cả khi bạn chưa rút được Yasuo, chỉ riêng Fae Bladetwirler kết hợp với Áp Đảo từ Beast Within và Làm Choáng tự động 3★ cũng đủ sức tự mình đấm vỡ Nhà Chính địch!',
              en: 'Even if Yasuo is at the bottom of your deck, an Overwhelm Fae Bladetwirler scaled by your 3★ Round Start stuns can solo-carry games!'
            }
          ]
        },
        videoShowcase: {
          youtubeId: 'tgbNymZ7vqY',
          title: {
            vi: 'YASUO Overwhelm (Beast Within + Tempest Blade) Càn Quét Bản Đồ Tuần',
            en: 'YASUO Overwhelm Build (Beast Within + Tempest Blade) Weekly Nightmare Clear'
          },
          bossTag: 'VS WEEKLY NIGHTMARE',
          duration: '02:20',
          patch: 'OVERWHELM BUILD',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Tại sao Áp Đảo (Overwhelm) cực hợp với Fae Bladetwirler', en: 'Why Overwhelm Transforms Fae Bladetwirler' } },
            { time: 15, label: '00:15', title: { vi: 'Bước 1: Nuôi Fae Bladetwirler lên 20 Sức Mạnh', en: 'Step 1: Scaling Fae Bladetwirler to 20+ Attack' } },
            { time: 60, label: '01:00', title: { vi: 'Bước 2: Everfrost kích nổ Tempest Blade', en: 'Step 2: Everfrost into Tempest Blade Chain' } }
          ]
        }
      },

      F2P_RARE: {
        id: 'F2P_RARE',
        starReq: '3★ F2P CLASSIC',
        difficulty: { vi: 'DỄ // CHUẨN TÂN THỦ', en: 'EASY // BEGINNER FRIENDLY' },
        label: { vi: 'CHUẨN CƠ BẢN F2P (NO EPIC)', en: 'F2P CLASSIC STUN LOCK' },
        winRate: '97.4%',
        clearTime: '05m 20s',
        summary: {
          vi: 'Bộ đôi Tempest Blade + Everfrost + Grand General\'s Counterplan kinh điển giúp khóa cứng mọi con Boss mà không cần bất kỳ cổ vật Tím nào.',
          en: 'Classic Tempest Blade + Everfrost + Grand General\'s Counterplan for unbreakable stun locks without needing a single Epic relic.'
        },
        slots: [
          {
            name: { vi: 'Kiếm Bão Tố (Tempest Blade)', en: 'Tempest Blade' },
            rarity: 'RARE',
            icon: '🌪️',
            effect: {
              vi: 'Nhận miễn phí từ Nhiệm Vụ Cốt Truyện 2★ của Miss Fortune.',
              en: 'Obtained for free from completing Miss Fortune\'s 2★ Campaign.'
            },
            synergyNote: {
              vi: 'Vũ khí trấn phái miễn phí của Yasuo từ nhiệm vụ cốt truyện Miss Fortune.',
              en: 'Yasuo\'s signature board-stun relic, obtained free from Miss Fortune\'s campaign.'
            }
          },
          {
            name: { vi: 'Kế Sách Đại Tướng (Grand General\'s Counterplan)', en: 'The Grand General\'s Counterplan' },
            rarity: 'RARE',
            icon: '📜',
            effect: {
              vi: 'Mỗi đầu vòng tạo 1 Bão Thép (Yasuo\'s Steel Tempest) trên tay.',
              en: 'Round Start: Creates a fleeting Yasuo\'s Steel Tempest in hand.'
            },
            synergyNote: {
              vi: 'Nhận miễn phí từ cốt truyện 2★ của Vi! Cho bạn 1 lá Bão Thép (Làm Choáng + Rút 1 lá) mỗi vòng đấu.',
              en: 'Free from Vi\'s 2★ campaign! Generates a Steel Tempest (Stun + Draw 1) every single round.'
            }
          },
          {
            name: { vi: 'Băng Giá Vĩnh Cửu (Everfrost)', en: 'Everfrost' },
            rarity: 'COMMON',
            icon: '❄️',
            effect: {
              vi: 'Làm Choáng kẻ địch mạnh nhất khi triệu hồi.',
              en: 'When summoned, Stun the strongest enemy.'
            },
            synergyNote: {
              vi: 'Cổ vật Common cực dễ mở, giúp Yasuo làm choáng ngay cả ở lượt đối phương không tấn công.',
              en: 'Common relic that guarantees an immediate stun on summon.'
            }
          }
        ],
        playGuide: {
          mulligan: {
            vi: 'Giữ Yasuo, Fae Bladetwirler và các đơn vị làm choáng rẻ tiền.',
            en: 'Keep Yasuo, Fae Bladetwirler, and low-cost stun units.'
          },
          comboSteps: [
            {
              step: '01',
              phase: { vi: 'BƯỚC 1 // KIỂM SOÁT BÀN ĐẤU ĐẦU TRẬN', en: 'STEP 1 // EARLY ROUND STUN CONTROL' },
              action: {
                vi: 'Tận dụng Làm Choáng tự động đầu vòng và Bão Thép để tích đủ 4/5 điểm thăng cấp cho Yasuo.',
                en: 'Use automatic Round Start stuns and Steel Tempest to reach 4/5 level-up progress.'
              },
              videoTime: 12,
              timeLabel: '00:12'
            },
            {
              step: '02',
              phase: { vi: 'BƯỚC 2 // BÃO THÉP VÔ TẬN MỖI VÒNG', en: 'STEP 2 // INFINITE STEEL TEMPEST LOOP' },
              action: {
                vi: 'Triệu hồi Yasuo kích hoạt Everfrost + Tempest Blade. Từ vòng sau, Kế Sách Đại Tướng cho bạn 1 Bão Thép miễn phí mỗi vòng để khóa chết Boss!',
                en: 'Summon Yasuo to trigger Everfrost + Tempest Blade, then use Counterplan\'s fleeting Steel Tempest every turn!'
              },
              videoTime: 50,
              timeLabel: '00:50'
            }
          ],
          proTips: [
            {
              vi: 'Vì Bão Thép của Yasuo có trang bị "Rút 1 lá bài" ở Cấp 9, mỗi lần bạn đánh Bão Thép tạo từ Kế Sách Đại Tướng, bạn vừa làm choáng vừa rút thêm bài và xào thêm 1 Yasuo vào bộ bài!',
              en: 'Because Yasuo\'s Steel Tempest has "Draw 1" attached at Level 9, casting the fleeting copy from Counterplan also draws you a card every round!'
            }
          ]
        },
        videoShowcase: null,
        fallbackVideoShowcase: {
          youtubeId: '3JZ_D3ELwOQ',
          title: {
            vi: 'YASUO 3★ F2P (Tempest Blade + Counterplan) Hướng Dẫn Cho Người Mới',
            en: '3★ F2P YASUO (Tempest Blade + Counterplan) Complete Beginner Guide'
          },
          bossTag: 'F2P CAMPAIGN CLEAR',
          duration: '03:15',
          patch: '100% FREE RELICS',
          chapters: [
            { time: 0, label: '00:00', title: { vi: 'Nhận Tempest Blade & Counterplan miễn phí ở đâu?', en: 'Where to Unlock Tempest Blade & Counterplan Free' } },
            { time: 12, label: '00:12', title: { vi: 'Bước 1: Canh điểm 4/5 tiến trình Thăng Cấp', en: 'Step 1: Setting Up 4/5 Level Progress' } },
            { time: 50, label: '00:50', title: { vi: 'Bước 2: Vòng lặp Bão Thép vô tận mỗi lượt', en: 'Step 2: Infinite Steel Tempest Control Loop' } }
          ]
        }
      }
    },
    recommendations: {
      powers: [
        { name: { vi: 'Đứng Yên Đó! (Hold It!)', en: 'Hold It!' }, rarity: 'RARE', desc: { vi: 'Khi bắt đầu mọi vòng đấu: Làm Choáng kẻ địch mạnh nhất (Làm choáng 2 mục tiêu mỗi vòng cùng 3★!).', en: 'Round Start: Stun the strongest enemy (Stuns 2 enemies every round with Yasuo 3★!).' } },
        { name: { vi: 'Năng Lượng Hoàn Trả (Spellslinger)', en: 'Spellslinger' }, rarity: 'RARE', desc: { vi: 'Bài phép Bão Thép của bạn giảm 1 năng lượng tiêu hao.', en: 'Your spells cost 1 less.' } }
      ],
      items: [
        { name: { vi: 'Viên Đá Tri Thức (Oracle\'s Lens)', en: 'Oracle\'s Lens' }, rarity: 'COMMON', desc: { vi: 'Gắn vào các bài phép Làm Choáng / Thu Hồi để không bao giờ hết bài.', en: 'Attach to Stun/Recall spells for endless card draw.' } }
      ],
      supportChamps: [
        { name: 'Leona', region: 'Targon', synergy: 'S+ Tier // Chuỗi Làm Choáng Ban Ngày liên hoàn' },
        { name: 'Kennen', region: 'Ionia', synergy: 'S Tier // Thu Hồi & Làm Choáng tốc độ cao' },
        { name: 'Malphite', region: 'Targon', synergy: 'A+ Tier // Choáng toàn bàn không thể ngăn cản' }
      ]
    },
    communityRatings: [
      {
        user: 'Windamura_Ionia',
        stars: '6★',
        rating: 9.7,
        loadoutUsed: '6★ TEMPEST SOVEREIGN',
        comment: {
          vi: 'Cảm giác thả Yasuo xuống sân nhìn anh ta chém 10 nhát liên tục quét sạch bàn đấu của Lissandra không bao giờ chán!',
          en: 'Dropping Yasuo and watching him slash the entire enemy board 10 times in a row never gets old!'
        }
      }
    ]
  }
};

// Danh sách Roster mở rộng dưới chân trang (tương tự Explore More Fighters của Tactical)
const ROSTER_PREVIEW = [
  { id: 'jinx', name: 'JINX', role: 'Burn / Discard', stars: '6★', img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040-full.png', playableInDemo: true },
  { id: 'aurelionsol', name: 'AURELION SOL', role: 'Cosmic Ramp', stars: '4★', img: 'https://dd.b.pvp.net/latest/set3/en_us/img/cards/03MT087-full.png', playableInDemo: true },
  { id: 'yasuo', name: 'YASUO', role: 'Stun Control', stars: '6★', img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01IO015-full.png', playableInDemo: true },
  { id: 'swain', name: 'SWAIN', role: 'Spell Siege', stars: '6★', img: 'https://dd.b.pvp.net/latest/set2/en_us/img/cards/02NX007-full.png', playableInDemo: false },
  { id: 'viego', name: 'VIEGO', role: 'Mist Scaling', stars: '6★', img: 'https://dd.b.pvp.net/latest/set4/en_us/img/cards/04SI055-full.png', playableInDemo: false },
  { id: 'fiddlesticks', name: 'FIDDLESTICKS', role: 'Terrify Mill', stars: '6★', img: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01SI030-full.png', playableInDemo: false },
  { id: 'ahri', name: 'AHRI', role: 'Recall Combo', stars: '6★', img: 'https://dd.b.pvp.net/latest/set5/en_us/img/cards/05IO004-full.png', playableInDemo: false },
  { id: 'ekko', name: 'EKKO', role: 'Predict Loop', stars: '6★', img: 'https://dd.b.pvp.net/latest/set4/en_us/img/cards/04PZ001-full.png', playableInDemo: false }
];

// Từ điển song ngữ (tương thích với LanguageContext.jsx trong repo của bạn)
const I18N = {
  vi: {
    navChampions: 'TƯỚNG POC',
    navPowers: 'CHÒM SAO',
    navRelics: 'CỔ VẬT & VIDEO',
    navDeck: 'BỘ BÀI',
    navSynergies: 'TƯƠNG TÁC',
    exploreMoves: 'KHÁM PHÁ SỨC MẠNH & CHÒM SAO',
    viewRelics: 'BỘ CỔ VẬT & VIDEO HƯỚNG DẪN',
    region: 'KHU VỰC',
    archetype: 'LỐI CHƠI CHỦ ĐẠO',
    tierSpeed: 'XẾP HẠNG & TỐC ĐỘ',
    counterNote: 'ĐIỂM YẾU CẦN LƯU Ý',
    playstyleRadar: 'CHỈ SỐ CHIẾN THUẬT 6 TRỤC (PLAYSTYLE MATRIX)',
    movesTitle: 'BẢNG SỨC MẠNH & CHÒM SAO',
    movesSub: '// DỮ LIỆU CHIẾN ĐẤU TƯƠNG TÁC (Tactical MOVES LIST LAYOUT)',
    tabAll: 'TẤT CẢ KỸ NĂNG',
    tabStars: 'SỨC MẠNH SAO (1★-6★)',
    tabConstellation: 'NÚT CHÒM SAO',
    tabLevels: 'NÂNG CẤP CẤP ĐỘ',
    inspectorMode: 'MÀN HÌNH CHI TIẾT',
    starMapMode: 'BẢN ĐỒ CHÒM SAO',
    tacticalTip: 'MẸO CHIẾN THUẬT TỪ CAO THỦ POC',
    unlockCost: 'CHI PHÍ MỞ KHÓA',
    relicsTitle: 'BỘ CỔ VẬT, HƯỚNG DẪN CHƠI & VIDEO SHOWCASE',
    relicsSub: '// MỖI BỘ CỔ VẬT ĐI KÈM HƯỚNG DẪN VẬN HÀNH & VIDEO THỰC CHIẾN RIÊNG BIỆT',
    selectBuildPrompt: 'CHỌN CẤU HÌNH CỔ VẬT ĐỂ XEM HƯỚNG DẪN & VIDEO TƯƠNG ỨNG:',
    clickRelicPrompt: 'BẤM VÀO TỪNG Ô CỔ VẬT ĐỂ XEM PHÂN TÍCH TƯƠNG TÁC:',
    synergyAnalysis: 'PHÂN TÍCH TƯƠNG TÁC CỔ VẬT TRONG BUILD NÀY',
    mulliganTitle: '1. ƯU TIÊN GIỮ BÀI ĐẦU TRẬN (MULLIGAN PRIORITY)',
    comboTitle: '2. CHUỖI COMBO & VẬN HÀNH THEO LƯỢT (ĐỒNG BỘ VIDEO)',
    comboSyncHint: 'Bấm vào nút [▶ Tua Video] ở từng bước để xem trực tiếp pha xử lý đó bên màn hình phải!',
    proTipsTitle: '3. MẸO NÂNG CAO & KHẮC CHẾ BOSS ÁC MỘNG',
    videoReadyBadge: 'CÓ VIDEO',
    noVideoBadge: 'CHỈ HƯỚNG DẪN CHỮ',
    jumpToVideo: 'Tua đến',
    playingAt: 'Đang phát mốc',
    videoMonitorHeader: 'MÀN HÌNH VIDEO THỰC CHIẾN CỦA BỘ CỔ VẬT',
    videoChaptersTitle: 'PHÂN ĐOẠN CHIẾN THUẬT TRONG VIDEO (TIMESTAMPS)',
    noVideoTitle: 'BỘ CỔ VẬT NÀY CHƯA CÓ VIDEO GHI HÌNH',
    noVideoDesc: 'Trong dữ liệu thực tế, nếu một bộ Cổ Vật phụ chưa có link YouTube (build.videoShowcase = null), hệ thống sẽ tự động hiển thị Bảng Tóm Tắt Thông Số Chiến Thuật này hoặc bạn có thể bấm nút bên dưới để bật thử Video mẫu!',
    enableDemoVideoBtn: 'BẬT THỬ VIDEO MẪU CHO BỘ CỔ VẬT NÀY',
    startingDeckTitle: 'BỘ BÀI KHỞI ĐẦU & TRANG BỊ CẤP ĐỘ',
    startingDeckSub: '// BẤM VÀO LÁ BÀI ĐỂ XEM CHI TIẾT TRANG BỊ VÀ ĐỘ ƯU TIÊN GIỮ BÀI',
    bestPowers: 'SỨC MẠNH PHIÊU LƯU TỐT NHẤT',
    bestSupports: 'TƯỚNG HỖ TRỢ HỢP NHẤT',
    communityTitle: 'ĐÁNH GIÁ TỪ CỘNG ĐỒNG CAO THỦ POC',
    exploreFighters: 'CHỌN ĐẤU SĨ TIẾP THEO',
    statLabels: {
      damage: 'SÁT THƯƠNG',
      defense: 'PHÒNG THỦ',
      speed: 'TỐC ĐỘ',
      consistency: 'ỔN ĐỊNH',
      synergy: 'TƯƠNG TÁC',
      independence: 'ĐỘC LẬP'
    }
  },
  en: {
    navChampions: 'CHAMPIONS',
    navPowers: 'CONSTELLATION',
    navRelics: 'RELIC BUILDS & VIDEO',
    navDeck: 'STARTING DECK',
    navSynergies: 'SYNERGIES',
    exploreMoves: 'EXPLORE STAR POWERS & NODES',
    viewRelics: 'RELIC LOADOUTS & BUILD VIDEOS',
    region: 'REGION',
    archetype: 'PLAYSTYLE ARCHETYPE',
    tierSpeed: 'META TIER & SPEED',
    counterNote: 'HAZARD / COUNTER',
    playstyleRadar: '6-AXIS TACTICAL PLAYSTYLE MATRIX',
    movesTitle: 'STAR POWERS & CONSTELLATION',
    movesSub: '// INTERACTIVE COMBAT DATA (Tactical MOVES LIST LAYOUT)',
    tabAll: 'ALL ABILITIES',
    tabStars: 'STAR POWERS (1★-6★)',
    tabConstellation: 'CONSTELLATION NODES',
    tabLevels: 'LEVEL UPGRADES',
    inspectorMode: 'TACTICAL INSPECTOR',
    starMapMode: 'INTERACTIVE STAR MAP',
    tacticalTip: 'PRO POC TACTICAL SYNERGY TIP',
    unlockCost: 'UNLOCK REQUIREMENT',
    relicsTitle: 'RELIC LOADOUTS, EXECUTION GUIDE & VIDEO SHOWCASE',
    relicsSub: '// EACH RELIC BUILD FEATURES ITS OWN PLAYSTYLE GUIDE & SYNCED GAMEPLAY VIDEO',
    selectBuildPrompt: 'SELECT A RELIC LOADOUT PRESET TO INSPECT ITS GUIDE & VIDEO:',
    clickRelicPrompt: 'CLICK ANY RELIC SLOT BELOW TO INSPECT SYNERGY BREAKDOWN:',
    synergyAnalysis: 'RELIC SYNERGY BREAKDOWN FOR THIS LOADOUT',
    mulliganTitle: '1. OPENING HAND MULLIGAN PRIORITY',
    comboTitle: '2. TURN-BY-TURN COMBO EXECUTION (VIDEO-SYNCED)',
    comboSyncHint: 'Click [▶ Jump to Video] on any step to seek the attached build video to that exact moment!',
    proTipsTitle: '3. PRO SYNERGY TIPS & NIGHTMARE BOSS COUNTERS',
    videoReadyBadge: 'VIDEO READY',
    noVideoBadge: 'TEXT GUIDE ONLY',
    jumpToVideo: 'Jump to',
    playingAt: 'Playing at',
    videoMonitorHeader: 'BUILD-SPECIFIC GAMEPLAY SHOWCASE MONITOR',
    videoChaptersTitle: 'VIDEO TACTICAL TIMESTAMPS & CHAPTERS',
    noVideoTitle: 'NO VIDEO ATTACHED TO THIS RELIC LOADOUT YET',
    noVideoDesc: 'In production, when a secondary relic loadout does not have a video URL (build.videoShowcase === null), this Tactical Loadout Telemetry card is displayed gracefully—or click below to simulate a video!',
    enableDemoVideoBtn: 'SIMULATE DEMO VIDEO FOR THIS BUILD',
    startingDeckTitle: 'STARTING DECK & ITEM UPGRADES',
    startingDeckSub: '// CLICK ANY CARD TO INSPECT ATTACHED LEVEL ITEMS & MULLIGAN PRIORITY',
    bestPowers: 'BEST ADVENTURE POWERS',
    bestSupports: 'TOP SUPPORT CHAMPIONS',
    communityTitle: 'COMMUNITY BUILD RATINGS & REVIEWS',
    exploreFighters: 'EXPLORE MORE CHAMPIONS',
    statLabels: {
      damage: 'DAMAGE',
      defense: 'DEFENSE',
      speed: 'SPEED',
      consistency: 'CONSISTENCY',
      synergy: 'SYNERGY',
      independence: 'INDEPENDENCE'
    }
  }
};

export default function App() {
  // States điều khiển toàn trang
  const [lang, setLang] = useState('vi');
  const [activeChampKey, setActiveChampKey] = useState('jinx');
  const [cardLevelView, setCardLevelView] = useState(1); // 1 = Lv1, 2 = Lv2
  const [moveCategory, setMoveCategory] = useState('ALL');
  const [selectedMoveId, setSelectedMoveId] = useState('jinx-star-1');
  const [previewMode, setPreviewMode] = useState('INSPECTOR'); // 'INSPECTOR' | 'STARMAP'
  const [selectedDeckCardIdx, setSelectedDeckCardIdx] = useState(0);

  // States điều khiển Khu vực Bộ Cổ Vật + Hướng dẫn vận hành + Video gắn kèm từng Build
  const [activeRelicTab, setActiveRelicTab] = useState('BIS_ENDGAME');
  const [selectedRelicSlotIdx, setSelectedRelicSlotIdx] = useState(0);
  const [videoSimMode, setVideoSimMode] = useState('AUTO'); // 'AUTO' (Build 1 & 2 có video, Build 3 ẩn để test) | 'ALL_ON' | 'ALL_OFF'
  const [activeVideoTimestamp, setActiveVideoTimestamp] = useState(0);
  const [activeComboStepIdx, setActiveComboStepIdx] = useState(0);
  const [copiedRepoNote, setCopiedRepoNote] = useState(false);

  const champ = (CHAMPIONS_DB as Record<string, any>)[activeChampKey] || (CHAMPIONS_DB as Record<string, any>).jinx;
  const t = (I18N as Record<string, any>)[lang] || (I18N as Record<string, any>).vi;

  // Khi đổi tướng, reset các lựa chọn về mặc định
  useEffect(() => {
    if (champ?.moves?.[0]) {
      setSelectedMoveId(champ.moves[0].id);
    }
    setSelectedDeckCardIdx(0);
    setCardLevelView(1);
    setMoveCategory('ALL');
    setActiveRelicTab('BIS_ENDGAME');
    setSelectedRelicSlotIdx(0);
    setActiveVideoTimestamp(0);
    setActiveComboStepIdx(0);
  }, [activeChampKey, champ]);

  // Khi đổi tab Bộ Cổ Vật, reset ô cổ vật đang chọn và đưa thời gian video về 00:00
  useEffect(() => {
    setSelectedRelicSlotIdx(0);
    setActiveVideoTimestamp(0);
    setActiveComboStepIdx(0);
  }, [activeRelicTab]);

  // Danh sách chiêu/sức mạnh đã lọc
  const filteredMoves = useMemo(() => {
    if (!champ?.moves) return [];
    if (moveCategory === 'ALL') return champ.moves;
    return champ.moves.filter((m: any) => m.category === moveCategory);
  }, [champ, moveCategory]);

  // Chiêu thức đang được chọn ở khung Preview Sticky bên phải
  const selectedMove = useMemo(() => {
    if (!champ?.moves?.length) return null;
    return champ.moves.find((m: any) => m.id === selectedMoveId) || champ.moves[0];
  }, [champ, selectedMoveId]);

  // Bộ Cổ Vật đang chọn
  const currentRelicBuild = champ.relicSets?.[activeRelicTab] || champ.relicSets?.BIS_ENDGAME || Object.values(champ.relicSets || {})[0] || {};
  const activeRelicSlot = currentRelicBuild?.slots?.[selectedRelicSlotIdx] || currentRelicBuild?.slots?.[0] || {};
  const activeDeckCard = champ.startingDeck?.[selectedDeckCardIdx] || champ.startingDeck?.[0] || {};

  // Xác định Video Showcase của Bộ Cổ Vật hiện tại (hỗ trợ cả 3 chế độ giả lập: AUTO, ALL_ON, ALL_OFF)
  const activeBuildVideo = useMemo(() => {
    if (videoSimMode === 'ALL_OFF') return null;
    if (videoSimMode === 'ALL_ON') {
      return currentRelicBuild.videoShowcase || currentRelicBuild.fallbackVideoShowcase || null;
    }
    // Chế độ AUTO: Hiển thị đúng theo dữ liệu thực tế của từng Build (Build 1 & 2 có sẵn video, Build 3 F2P không có để dev thấy sự khác biệt)
    return currentRelicBuild.videoShowcase;
  }, [currentRelicBuild, videoSimMode]);

  // Hàm nhảy tới thời điểm cụ thể trong Video khi bấm vào Bước Combo hoặc Chapter
  const handleJumpToTimestamp = (seconds: number, stepIndex: number = 0) => {
    if (!activeBuildVideo && videoSimMode !== 'ALL_ON') {
      setVideoSimMode('ALL_ON');
    }
    setActiveVideoTimestamp(seconds);
    setActiveComboStepIdx(stepIndex);
  };

  // Hàm render Chip nút bấm kiểu game đối kháng Tactical (Input Notation Chips)
  const renderInputChip = (inp: string, index: number, total: number) => {
    let chipStyle = 'bg-[#1A1F2C] text-white border-gray-600';
    if (inp.includes('6★') || inp === 'NOVA') {
      chipStyle = 'bg-gradient-to-r from-[#D2FF28] to-[#00F5D4] text-black border-white font-extrabold shadow-[0_0_12px_rgba(210,255,40,0.5)]';
    } else if (inp.includes('4★') || inp.includes('5★')) {
      chipStyle = 'bg-[#00F5D4] text-black border-white font-extrabold';
    } else if (inp.includes('★')) {
      chipStyle = 'bg-[#D2FF28] text-black border-white font-extrabold';
    } else if (inp.includes('LV')) {
      chipStyle = 'bg-purple-500 text-white border-purple-300 font-bold';
    } else if (inp.includes('GEM') || inp.includes('NODE')) {
      chipStyle = 'bg-amber-400 text-black border-amber-200 font-bold';
    }

    return (
      <React.Fragment key={index}>
        <span
          className={`inline-flex items-center justify-center px-2.5 py-0.5 text-xs tracking-wider uppercase border ${chipStyle}`}
          style={{
            clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)'
          }}
        >
          {inp}
        </span>
        {index < total - 1 && (
          <span className="text-[#8E96AA] font-mono text-xs mx-0.5 font-bold">+</span>
        )}
      </React.Fragment>
    );
  };

  // Copy hướng dẫn tích hợp vào repo
  const handleCopyIntegration = () => {
    navigator.clipboard?.writeText(
      `// Tích hợp vào: fe/src/features/champions/components/championDetail.jsx & ChampionRelicSets.jsx\n// Mỗi phần tử trong relicSets chứa: slots[], playGuide { mulligan, comboSteps[], proTips[] }, và videoShowcase { youtubeId, chapters[] }`
    );
    setCopiedRepoNote(true);
    setTimeout(() => setCopiedRepoNote(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] font-sans selection:bg-[#D2FF28] selection:text-black overflow-x-hidden">
      {/* Nhúng Google Fonts: Anton (Tactical Display) + Space Grotesk + JetBrains Mono */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .font-display {
          font-family: 'Anton', sans-serif;
          letter-spacing: 0.03em;
        }
        .font-mono-tech {
          font-family: 'JetBrains Mono', monospace;
        }
        .bg-halftone {
          background-image: radial-gradient(rgba(210, 255, 40, 0.07) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .bg-hazard-stripes {
          background: repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.02),
            rgba(255, 255, 255, 0.02) 12px,
            transparent 12px,
            transparent 24px
          );
        }
        .stroke-giant {
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.07);
          color: transparent;
        }
        .clip-chamfer {
          clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
        }
        .clip-chamfer-sm {
          clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
        }
      `
        }}
      />

      {/* ==================== 1. RIOT / Tactical TACTICAL NAVBAR ==================== */}
      <header className="sticky top-0 z-50 bg-[#090A0F]/95 backdrop-blur-md border-b border-[#262B38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Brand + Main Nav */}
          <div className="flex items-center space-x-5 lg:space-x-7">
            <a href="#hero" className="flex items-center space-x-2.5 group">
              <div className="bg-[#D2FF28] text-black font-display text-2xl sm:text-3xl px-3 py-0.5 italic transform -skew-x-12 group-hover:bg-white transition">
                POC // Tactical
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#D2FF28] font-bold">
                  pocguide.top
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8E96AA]">
                  Build + Video Sync DB
                </span>
              </div>
            </a>

            <nav className="hidden xl:flex items-center space-x-5 text-xs font-bold tracking-widest uppercase">
              <a href="#hero" className="text-gray-300 hover:text-[#D2FF28] transition py-2">
                {t.navChampions}
              </a>
              <a href="#moves-list" className="text-gray-300 hover:text-[#D2FF28] transition py-2">
                {t.navPowers}
              </a>
              <a
                href="#relic-builds"
                className="text-[#D2FF28] border-b-2 border-[#D2FF28] py-2 flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{t.navRelics}</span>
              </a>
              <a href="#starting-deck" className="text-gray-300 hover:text-[#D2FF28] transition py-2">
                {t.navDeck} ({champ.startingDeck.length})
              </a>
              <a href="#synergies" className="text-gray-300 hover:text-[#D2FF28] transition py-2">
                {t.navSynergies}
              </a>
            </nav>
          </div>

          {/* Right Controls: Quick Champion Switcher + Build Video Sim Toggle + VI/EN Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Champion Pill Switcher */}
            <div className="flex items-center bg-[#12151E] border border-[#262B38] p-1 clip-chamfer-sm">
              {Object.values(CHAMPIONS_DB).map((c) => {
                const isSelected = c.id === activeChampKey;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChampKey(c.id)}
                    className={`px-2.5 sm:px-3 py-1 text-xs font-display uppercase tracking-wider transition clip-chamfer-sm ${
                      isSelected
                        ? 'bg-[#D2FF28] text-black shadow-[0_0_10px_rgba(210,255,40,0.4)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            {/* Build Video Simulation Toggle (Cho phép test trạng thái Build có hoặc không có Video) */}
            <button
              onClick={() => {
                const nextMode =
                  videoSimMode === 'AUTO'
                    ? 'ALL_ON'
                    : videoSimMode === 'ALL_ON'
                    ? 'ALL_OFF'
                    : 'AUTO';
                setVideoSimMode(nextMode);
              }}
              className={`hidden md:flex items-center space-x-1.5 border px-2.5 py-2 text-[11px] font-mono-tech font-bold transition clip-chamfer-sm ${
                videoSimMode === 'ALL_OFF'
                  ? 'bg-red-950/50 border-red-500/60 text-red-300'
                  : 'bg-[#12151E] border-[#00F5D4]/60 text-[#00F5D4] hover:border-[#D2FF28]'
              }`}
              title="Toggle Build Video Showcase visibility (AUTO / ALL ON / ALL OFF)"
            >
              {videoSimMode === 'ALL_OFF' ? (
                <VideoOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Video className="w-3.5 h-3.5 text-[#D2FF28]" />
              )}
              <span>VIDEO: {videoSimMode}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center space-x-1.5 bg-[#12151E] hover:bg-[#1A1F2C] border border-[#262B38] hover:border-[#D2FF28] px-3 py-2 text-xs font-mono-tech font-bold text-white transition clip-chamfer-sm"
              title="Switch Language (VI / EN)"
            >
              <Globe className="w-3.5 h-3.5 text-[#D2FF28]" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO SECTION (Tactical SENNA BIO LAYOUT) ==================== */}
      <section
        id="hero"
        className="relative overflow-hidden border-b border-[#262B38] pt-10 pb-20 lg:py-20 bg-halftone bg-hazard-stripes"
      >
        {/* Giant Background Hollow Stroke Text */}
        <div className="absolute -top-6 left-0 right-0 pointer-events-none select-none overflow-hidden">
          <div className="font-display text-[9rem] sm:text-[15rem] lg:text-[20rem] leading-none uppercase italic stroke-giant tracking-tighter whitespace-nowrap">
            {champ.name} // {champ.region[lang]}
          </div>
        </div>

        {/* Ambient Neon Glows */}
        <div
          className="absolute top-1/4 right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-25"
          style={{ backgroundColor: champ.accentColor }}
        />
        <div
          className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-15"
          style={{ backgroundColor: champ.secondaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column (7 cols): Title, Lore Quote, 2x2 Bio Grid & 6-Axis Radar */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Slanted Status Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center space-x-2 bg-[#12151E] border border-[#00F5D4]/60 px-3.5 py-1 clip-chamfer-sm">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full animate-ping" />
                  <span className="text-[#00F5D4] font-bold uppercase tracking-widest text-xs">
                    {champ.title[lang]}
                  </span>
                </div>

                <div className="inline-flex items-center space-x-1 bg-[#D2FF28] text-black px-3 py-1 font-display uppercase text-xs tracking-wider transform -skew-x-12">
                  <span>MAX {champ.maxStars}★ CONSTELLATION</span>
                </div>

                <span className="font-mono-tech text-xs text-[#8E96AA] bg-black/60 px-2.5 py-1 border border-[#262B38]">
                  ID: {champ.code}
                </span>
              </div>

              {/* Giant Champion Name */}
              <div className="flex items-baseline justify-between">
                <h1
                  className="font-display text-6xl sm:text-8xl lg:text-9xl uppercase italic tracking-tight leading-none text-white"
                  style={{
                    textShadow: `0 6px 0 ${champ.accentColor}40`
                  }}
                >
                  {champ.name}
                </h1>
              </div>

              {/* Lore & Playstyle Quote */}
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-2xl border-l-4 border-[#D2FF28] pl-5 py-1 bg-[#12151E]/60 backdrop-blur-sm">
                {champ.loreQuote[lang]}
              </p>

              {/* 2x2 Bio & Tactical Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="bg-[#12151E]/95 border border-[#262B38] p-4 clip-chamfer-sm hover:border-[#D2FF28]/70 transition">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#8E96AA]">
                    {t.region}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-1 flex items-center justify-between">
                    <span>{champ.region[lang]}</span>
                    <span className="text-[#D2FF28] text-xs font-mono-tech">[{champ.regionCode}]</span>
                  </div>
                </div>

                <div className="bg-[#12151E]/95 border border-[#262B38] p-4 clip-chamfer-sm hover:border-[#D2FF28]/70 transition">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#8E96AA]">
                    {t.archetype}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#00F5D4] mt-1 flex items-center justify-between">
                    <span>{champ.bioGrid.archetype[lang]}</span>
                    <span className="text-[#00F5D4] text-xs font-mono-tech">[02]</span>
                  </div>
                </div>

                <div className="bg-[#12151E]/95 border border-[#262B38] p-4 clip-chamfer-sm hover:border-[#D2FF28]/70 transition">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#8E96AA]">
                    {t.tierSpeed}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-[#D2FF28] mt-1">
                    {champ.bioGrid.speed[lang]}
                  </div>
                </div>

                <div className="bg-[#12151E]/95 border border-[#262B38] p-4 clip-chamfer-sm hover:border-[#D2FF28]/70 transition">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#8E96AA]">
                    {t.counterNote}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-gray-200 mt-1">
                    {champ.bioGrid.weaknesses[lang]}
                  </div>
                </div>
              </div>

              {/* 6-Axis Tactical Playstyle Matrix */}
              <div className="bg-[#12151E]/90 border border-[#262B38] p-4 sm:p-5 clip-chamfer-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D2FF28] flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {t.playstyleRadar}
                  </span>
                  <span className="text-xs font-mono-tech text-[#8E96AA]">
                    RATING: {champ.tier} TIER
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(champ.stats || {}).map(([statKey, val]) => {
                    const numVal = Number(val) || 0;
                    return (
                      <div key={statKey} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-bold uppercase">
                            {t.statLabels?.[statKey] || statKey}
                          </span>
                          <span className="font-mono-tech text-[#D2FF28] font-bold">{numVal}/10</span>
                        </div>
                        <div className="w-full h-2 bg-black border border-[#262B38] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D2FF28] to-[#00F5D4] transition-all duration-500"
                            style={{ width: `${numVal * 10}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hero CTAs */}
              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="#relic-builds"
                  className="bg-[#D2FF28] text-black font-display uppercase tracking-wider text-base sm:text-lg px-7 py-3.5 clip-chamfer hover:bg-white transition inline-flex items-center space-x-2.5 shadow-[0_0_20px_rgba(210,255,40,0.3)]"
                >
                  <Film className="w-5 h-5" />
                  <span>{t.viewRelics}</span>
                </a>
                <a
                  href="#moves-list"
                  className="bg-[#12151E] border border-[#262B38] text-white font-display uppercase tracking-wider text-base sm:text-lg px-7 py-3.5 clip-chamfer hover:border-[#D2FF28] hover:text-[#D2FF28] transition inline-flex items-center space-x-2"
                >
                  <span>{t.exploreMoves}</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Column (5 cols): Level 1 / Level 2 Card & Splash Visualizer */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div
                  className="absolute -inset-2.5 opacity-35 clip-chamfer blur-sm transition-colors duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${champ.accentColor}, ${champ.secondaryColor}, transparent)`
                  }}
                />

                <div className="relative bg-[#12151E] border-2 border-[#262B38] clip-chamfer overflow-hidden group">
                  {/* Top Overlay: Level 1 / Level 2 Form Switcher */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCardLevelView(1)}
                        className={`text-xs font-display uppercase tracking-wider px-3.5 py-1.5 border transition clip-chamfer-sm ${
                          cardLevelView === 1
                            ? 'bg-[#D2FF28] text-black border-[#D2FF28]'
                            : 'bg-black/80 text-gray-300 border-[#262B38] hover:border-white'
                        }`}
                      >
                        LEVEL 1 FORM
                      </button>
                      <button
                        onClick={() => setCardLevelView(2)}
                        className={`text-xs font-display uppercase tracking-wider px-3.5 py-1.5 border transition clip-chamfer-sm ${
                          cardLevelView === 2
                            ? 'bg-[#00F5D4] text-black border-[#00F5D4]'
                            : 'bg-black/80 text-gray-300 border-[#262B38] hover:border-white'
                        }`}
                      >
                        LEVEL 2 ASCENDED
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-black/90 border border-[#262B38] px-2.5 py-1 font-mono-tech text-xs">
                      <span className="text-blue-400 font-bold">{champ.cost}M</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-amber-400 font-bold">
                        {cardLevelView === 1 ? champ.attack : champ.levelUpAttack}ATK
                      </span>
                      <span className="text-gray-600">/</span>
                      <span className="text-red-400 font-bold">
                        {cardLevelView === 1 ? champ.health : champ.levelUpHealth}HP
                      </span>
                    </div>
                  </div>

                  {/* Main Splash Artwork */}
                  <div className="relative h-[460px] w-full bg-black overflow-hidden">
                    <img
                      src={cardLevelView === 1 ? champ.splashLv1 : champ.splashLv2}
                      alt={champ.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/25 to-transparent" />

                    {/* Floating Full LoR Card Preview */}
                    <img
                      src={cardLevelView === 1 ? champ.cardLv1 : champ.cardLv2}
                      alt={`${champ.name} Card`}
                      className="absolute bottom-24 right-4 w-28 sm:w-32 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transform group-hover:-translate-y-2 transition duration-500"
                    />
                  </div>

                  {/* Bottom Callout: Signature Champion Spell */}
                  <div className="p-4 bg-[#090A0F]/95 border-t border-[#262B38] border-l-4 border-l-[#00F5D4]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-widest text-[#00F5D4] font-bold">
                        CHAMPION SPELL // {champ.champSpell.cost} MANA
                      </span>
                      <span className="text-[11px] font-mono-tech text-[#D2FF28]">
                        {champ.keywords.join(' • ')}
                      </span>
                    </div>
                    <div className="text-base font-display uppercase tracking-wide text-white mt-0.5">
                      {champ.champSpell.name[lang]}
                    </div>
                    <div className="text-xs text-gray-300 mt-0.5">
                      {champ.champSpell.desc[lang]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. MOVES LIST -> STAR POWERS & CONSTELLATION ==================== */}
      <section id="moves-list" className="py-20 border-b border-[#262B38] relative bg-halftone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header + Passive Trait Callout Box */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div>
              <div className="text-[#D2FF28] font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center space-x-2">
                <span>{t.movesSub}</span>
              </div>
              <h2 className="font-display text-5xl sm:text-6xl uppercase italic tracking-tight text-white mt-2">
                {t.movesTitle}
              </h2>
            </div>

            {/* Signature Passive Engine Box */}
            <div className="bg-gradient-to-r from-[#12151E] via-[#12151E] to-[#00F5D4]/15 border border-[#00F5D4]/60 p-5 clip-chamfer max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-0.5 bg-[#00F5D4] text-black font-bold text-xs uppercase tracking-wider">
                  CORE SYNERGY
                </span>
                <h3 className="font-display text-xl sm:text-2xl uppercase italic tracking-wide text-white">
                  {champ.passiveTrait.name[lang]}
                </h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {champ.passiveTrait.desc[lang]}
              </p>
            </div>
          </div>

          {/* Category Filter Tabs + Inspector / Star Map Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#262B38] pb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: `${t.tabAll} (${(champ.moves || []).length})` },
                {
                  key: 'STAR_POWERS',
                  label: `${t.tabStars} (${(champ.moves || []).filter((m: any) => m.category === 'STAR_POWERS').length})`
                },
                {
                  key: 'CONSTELLATION',
                  label: `${t.tabConstellation} (${(champ.moves || []).filter((m: any) => m.category === 'CONSTELLATION').length})`
                },
                {
                  key: 'LEVEL_UPGRADES',
                  label: `${t.tabLevels} (${(champ.moves || []).filter((m: any) => m.category === 'LEVEL_UPGRADES').length})`
                }
              ].map((tab) => {
                const isActive = moveCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMoveCategory(tab.key)}
                    className={`font-display uppercase tracking-wider px-5 py-2 text-sm sm:text-base clip-chamfer-sm transition ${
                      isActive
                        ? 'bg-[#D2FF28] text-black shadow-[0_0_15px_rgba(210,255,40,0.3)]'
                        : 'bg-[#12151E] text-gray-300 hover:text-white border border-[#262B38]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Toggle Right Monitor between Inspector & Constellation Map */}
            <div className="flex items-center bg-[#12151E] border border-[#262B38] p-1 clip-chamfer-sm">
              <button
                onClick={() => setPreviewMode('INSPECTOR')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition clip-chamfer-sm flex items-center gap-1.5 ${
                  previewMode === 'INSPECTOR'
                    ? 'bg-[#00F5D4] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.inspectorMode}</span>
              </button>
              <button
                onClick={() => setPreviewMode('STARMAP')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition clip-chamfer-sm flex items-center gap-1.5 ${
                  previewMode === 'STARMAP'
                    ? 'bg-[#00F5D4] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.starMapMode}</span>
              </button>
            </div>
          </div>

          {/* 2-Column Tactical Moves List Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Ability / Star Power Rows */}
            <div className="lg:col-span-7 space-y-3">
              {filteredMoves.map((move: any) => {
                const isSelected = selectedMove && move.id === selectedMove.id;
                return (
                  <div
                    key={move.id}
                    onClick={() => setSelectedMoveId(move.id)}
                    className={`cursor-pointer border-l-4 p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#D2FF28] bg-[#1A1F2C] shadow-[0_0_25px_rgba(210,255,40,0.12)]'
                        : 'border-[#262B38] bg-[#12151E] hover:border-gray-500 hover:bg-[#161A25]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`font-display text-xl sm:text-2xl uppercase tracking-wide ${
                            isSelected ? 'text-[#D2FF28]' : 'text-white'
                          }`}
                        >
                          {move.name[lang]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {move.badges.map((b: string, i: number) => (
                          <span
                            key={i}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                              b.includes('6★') || b.includes('Max')
                                ? 'bg-[#D2FF28]/15 border-[#D2FF28]/60 text-[#D2FF28]'
                                : b.includes('Constellation') || b.includes('Bonus')
                                ? 'bg-[#00F5D4]/15 border-[#00F5D4]/60 text-[#00F5D4]'
                                : 'bg-black/60 border-[#262B38] text-gray-300'
                            }`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 pt-0.5">
                        {move.desc[lang]}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 bg-black/70 px-3.5 py-2.5 border border-[#262B38] clip-chamfer-sm self-start sm:self-center">
                      {move.inputs.map((inp: string, idx: number) =>
                        renderInputChip(inp, idx, move.inputs.length)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Sticky Move Demonstration / Constellation Map Monitor */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-[#12151E] border-2 border-[#262B38] clip-chamfer overflow-hidden shadow-2xl">
                <div className="bg-black/80 px-5 py-3 border-b border-[#262B38] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D2FF28] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#D2FF28]">
                      {selectedMove.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-mono-tech text-[#00F5D4]">
                    {selectedMove.cost}
                  </span>
                </div>

                {previewMode === 'INSPECTOR' ? (
                  <div className="relative h-64 sm:h-72 bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedMove.img}
                      alt={selectedMove.name[lang]}
                      className="w-full h-full object-cover opacity-60 transition-all duration-500 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#090A0F] via-transparent to-[#D2FF28]/20 pointer-events-none" />

                    <div className="relative z-10 text-center px-6">
                      <div className="inline-flex items-center space-x-2 bg-black/85 border border-white/20 px-3 py-1 text-[11px] uppercase tracking-widest text-[#00F5D4] mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ABILITY DEMONSTRATION</span>
                      </div>
                      <h4 className="font-display text-3xl sm:text-4xl uppercase italic text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                        {selectedMove?.name?.[lang] || ''}
                      </h4>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-black/90 backdrop-blur px-4 py-2 border-l-4 border-[#D2FF28]">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#8E96AA]">
                        NODE TIER
                      </span>
                      <div className="flex items-center space-x-1">
                        {(selectedMove?.inputs || []).map((inp: string, idx: number) =>
                          renderInputChip(inp, idx, (selectedMove?.inputs || []).length)
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-72 bg-[#070912] overflow-hidden border-b border-[#262B38]">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 20% 35%, rgba(0,245,212,0.25) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(210,255,40,0.2) 0%, transparent 50%)'
                      }}
                    />

                    <div className="absolute top-3 left-4 z-10 text-[11px] font-mono-tech uppercase text-[#00F5D4]">
                      // CLICK ANY STAR NODE TO INSPECT
                    </div>

                    <svg className="w-full h-full">
                      {(champ.moves || []).map((node: any) =>
                        (node.nodePos?.connectedTo || []).map((targetId: string) => {
                          const target = (champ.moves || []).find((m: any) => m.id === targetId);
                          if (!target || !node.nodePos || !target.nodePos) return null;
                          return (
                            <line
                              key={`${node.id}-${targetId}`}
                              x1={`${node.nodePos.x}%`}
                              y1={`${node.nodePos.y}%`}
                              x2={`${target.nodePos.x}%`}
                              y2={`${target.nodePos.y}%`}
                              stroke="#D2FF28"
                              strokeOpacity="0.45"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          );
                        })
                      )}
                    </svg>

                    {(champ.moves || []).map((node: any) => {
                      if (!node.nodePos) return null;
                      const isNodeActive = selectedMove && node.id === selectedMove.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSelectedMoveId(node.id)}
                          style={{
                            left: `${node.nodePos.x}%`,
                            top: `${node.nodePos.y}%`
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all ${
                            isNodeActive ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-mono-tech text-[10px] font-bold ${
                              isNodeActive
                                ? 'bg-[#D2FF28] text-black border-white shadow-[0_0_20px_#D2FF28]'
                                : 'bg-[#12151E] text-white border-[#00F5D4] hover:border-[#D2FF28]'
                            }`}
                          >
                            {node.inputs[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl uppercase italic text-white">
                      {selectedMove.name[lang]}
                    </h3>
                    <p className="text-gray-200 text-sm sm:text-base leading-relaxed mt-2">
                      {selectedMove.desc[lang]}
                    </p>
                  </div>

                  <div className="bg-black/60 border-l-4 border-[#00F5D4] p-3.5 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#00F5D4] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{t.tacticalTip}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {selectedMove.tip[lang]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#262B38] flex items-center justify-between text-xs">
                    <span className="text-[#8E96AA] uppercase font-bold tracking-wider">
                      {t.unlockCost}:
                    </span>
                    <span className="font-mono-tech text-[#D2FF28] font-bold">
                      {selectedMove.cost}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. INTEGRATED RELIC LOADOUTS + PLAYSTYLE GUIDE + BUILD-SPECIFIC VIDEO SHOWCASE ==================== */}
      <section
        id="relic-builds"
        className="py-20 border-b border-[#262B38] bg-hazard-stripes relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
            <div>
              <div className="text-[#D2FF28] font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
                <Film className="w-4 h-4 text-[#00F5D4]" />
                <span>{t.relicsSub}</span>
              </div>
              <h2 className="font-display text-5xl sm:text-6xl uppercase italic text-white mt-1">
                {t.relicsTitle}
              </h2>
            </div>

            {/* Video Mode Indicator Bar */}
            <div className="flex items-center space-x-2 bg-[#12151E] border border-[#262B38] p-1.5 clip-chamfer-sm self-start lg:self-end">
              <span className="text-[11px] font-mono-tech uppercase text-[#8E96AA] px-2">
                BUILD VIDEO MODE:
              </span>
              {[
                { mode: 'AUTO', label: 'AUTO (REAL DB)' },
                { mode: 'ALL_ON', label: 'ALL ON' },
                { mode: 'ALL_OFF', label: 'HIDE VIDEO' }
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setVideoSimMode(m.mode)}
                  className={`px-2.5 py-1 text-[11px] font-mono-tech font-bold uppercase transition clip-chamfer-sm ${
                    videoSimMode === m.mode
                      ? 'bg-[#D2FF28] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Build Selector Tabs (With Star Badge & [VIDEO READY] Badge) */}
          <div className="mb-8">
            <div className="text-xs font-mono-tech uppercase tracking-wider text-[#8E96AA] mb-3">
              {t.selectBuildPrompt}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {Object.entries(champ.relicSets || {}).map(([tabKey, setObj]: [string, any]) => {
                const isSelected = activeRelicTab === tabKey;
                const hasVideo =
                  videoSimMode === 'ALL_ON'
                    ? true
                    : videoSimMode === 'ALL_OFF'
                    ? false
                    : Boolean(setObj.videoShowcase);

                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveRelicTab(tabKey)}
                    className={`text-left p-4 border-l-4 transition-all clip-chamfer-sm flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#1A1F2C] border-[#D2FF28] shadow-[0_0_25px_rgba(210,255,40,0.18)]'
                        : 'bg-[#12151E] border-[#262B38] hover:border-gray-500 hover:bg-[#161A25]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span
                        className={`text-[10px] font-mono-tech font-extrabold uppercase px-2 py-0.5 ${
                          isSelected
                            ? 'bg-[#D2FF28] text-black'
                            : 'bg-black/70 text-gray-300 border border-[#262B38]'
                        }`}
                      >
                        {setObj.starReq}
                      </span>

                      {hasVideo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/50">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{t.videoReadyBadge}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase px-2 py-0.5 bg-black/60 text-gray-400 border border-[#262B38]">
                          <BookOpen className="w-2.5 h-2.5" />
                          <span>{t.noVideoBadge}</span>
                        </span>
                      )}
                    </div>

                    <div
                      className={`font-display text-xl sm:text-2xl uppercase italic tracking-wide ${
                        isSelected ? 'text-[#D2FF28]' : 'text-white'
                      }`}
                    >
                      {setObj.label[lang]}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8E96AA] pt-1 border-t border-[#262B38]/80 w-full">
                      <span>WIN: <strong className="text-white">{setObj.winRate}</strong></span>
                      <span>AVG: <strong className="text-[#00F5D4]">{setObj.clearTime}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN 12-COLUMN SPLIT: Left (7 Cols: 3 Relics + Playstyle Execution Guide) & Right (5 Cols Sticky: Build Video Showcase Monitor) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (7 Cols): Relic Slots + Synergy Breakdown + Mulligan + Turn-by-Turn Combo + Pro Tips */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Loadout Summary Banner */}
              <div className="bg-[#12151E] border-2 border-[#262B38] p-5 sm:p-6 clip-chamfer">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-[#D2FF28] text-black font-display uppercase text-xs tracking-wider">
                      LOADOUT OVERVIEW
                    </span>
                    <span className="text-xs font-mono-tech text-[#00F5D4] font-bold">
                      // {currentRelicBuild.difficulty[lang]}
                    </span>
                  </div>
                  <span className="text-xs font-mono-tech text-[#8E96AA]">
                    ID: {champ.id.toUpperCase()}_{currentRelicBuild.id}
                  </span>
                </div>

                <h3 className="font-display text-3xl uppercase italic text-white">
                  {currentRelicBuild.label[lang]}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mt-2 leading-relaxed border-l-4 border-[#00F5D4] pl-4">
                  {currentRelicBuild.summary[lang]}
                </p>

                {/* 3 Interactive Relic Slots */}
                <div className="mt-6">
                  <div className="text-[11px] font-mono-tech uppercase tracking-wider text-[#D2FF28] mb-2.5 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{t.clickRelicPrompt}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(currentRelicBuild.slots || []).map((slot: any, i: number) => {
                      const isSlotSelected = selectedRelicSlotIdx === i;
                      const rarityBadge =
                        slot.rarity === 'EPIC'
                          ? 'border-purple-500 text-purple-300 bg-purple-500/15'
                          : slot.rarity === 'RARE'
                          ? 'border-[#00F5D4] text-[#00F5D4] bg-[#00F5D4]/15'
                          : 'border-emerald-400 text-emerald-300 bg-emerald-500/15';

                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedRelicSlotIdx(i)}
                          className={`cursor-pointer p-4 border-2 transition-all clip-chamfer-sm relative ${
                            isSlotSelected
                              ? 'bg-[#1A1F2C] border-[#D2FF28] shadow-[0_0_20px_rgba(210,255,40,0.18)]'
                              : 'bg-[#090A0F] border-[#262B38] hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono-tech text-[10px] text-[#8E96AA] font-bold">
                              SLOT 0{i + 1}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${rarityBadge}`}>
                              {slot.rarity}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2.5 my-1.5">
                            <div className="w-9 h-9 rounded bg-[#12151E] border border-[#262B38] flex items-center justify-center text-lg shrink-0">
                              {slot.icon}
                            </div>
                            <h4
                              className={`font-display text-lg uppercase italic leading-tight ${
                                isSlotSelected ? 'text-[#D2FF28]' : 'text-white'
                              }`}
                            >
                              {slot.name[lang]}
                            </h4>
                          </div>

                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                            {slot.effect[lang]}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Relic Synergy Breakdown Callout */}
                  <div className="mt-3.5 bg-black/80 border border-[#D2FF28]/50 border-l-4 border-l-[#D2FF28] p-4 clip-chamfer-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#D2FF28] font-bold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>
                          {t.synergyAnalysis}: {activeRelicSlot.name[lang]}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono-tech text-[#00F5D4]">
                        SLOT 0{selectedRelicSlotIdx + 1} ACTIVE
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1.5 leading-relaxed">
                      {activeRelicSlot.synergyNote[lang]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution Guide Block 1: Opening Hand Mulligan Priority */}
              <div className="bg-[#12151E] border border-[#262B38] p-5 sm:p-6 clip-chamfer-sm">
                <h4 className="font-display text-2xl uppercase italic text-[#00F5D4] flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  <span>{t.mulliganTitle}</span>
                </h4>
                <p className="text-gray-200 text-sm sm:text-base mt-2.5 leading-relaxed bg-black/50 p-4 border-l-4 border-[#00F5D4]">
                  {currentRelicBuild.playGuide.mulligan[lang]}
                </p>
              </div>

              {/* Execution Guide Block 2: Interactive Turn-by-Turn Combo Execution (Synced with Build Video!) */}
              <div className="bg-[#12151E] border border-[#262B38] p-5 sm:p-6 clip-chamfer-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="font-display text-2xl uppercase italic text-[#D2FF28] flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    <span>{t.comboTitle}</span>
                  </h4>
                  <span className="text-[11px] font-mono-tech text-[#00F5D4] bg-black/60 px-2.5 py-1 border border-[#00F5D4]/40">
                    // CLICK STEP TO SYNC VIDEO
                  </span>
                </div>

                <p className="text-xs text-[#8E96AA] mb-4">{t.comboSyncHint}</p>

                <div className="space-y-3">
                  {(currentRelicBuild.playGuide?.comboSteps || []).map((cStep: any, idx: number) => {
                    const isStepActive = activeComboStepIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleJumpToTimestamp(cStep.videoTime, idx)}
                        className={`cursor-pointer p-4 border-l-4 transition-all clip-chamfer-sm ${
                          isStepActive
                            ? 'bg-[#1A1F2C] border-[#D2FF28] shadow-[0_0_20px_rgba(210,255,40,0.12)]'
                            : 'bg-black/60 border-[#262B38] hover:border-[#00F5D4]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`font-display text-lg px-2 py-0.5 ${
                                isStepActive
                                  ? 'bg-[#D2FF28] text-black'
                                  : 'bg-[#12151E] text-[#D2FF28] border border-[#262B38]'
                              }`}
                            >
                              STEP {cStep.step}
                            </span>
                            <span className="font-display text-lg uppercase italic text-white">
                              {cStep.phase[lang]}
                            </span>
                          </div>

                          {/* Jump to Timestamp Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJumpToTimestamp(cStep.videoTime, idx);
                            }}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-mono-tech font-bold uppercase transition clip-chamfer-sm ${
                              isStepActive && activeVideoTimestamp === cStep.videoTime
                                ? 'bg-[#00F5D4] text-black shadow-[0_0_12px_rgba(0,245,212,0.5)]'
                                : 'bg-[#12151E] text-[#00F5D4] border border-[#00F5D4]/50 hover:bg-[#00F5D4] hover:text-black'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>
                              {t.jumpToVideo} {cStep.timeLabel}
                            </span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-1">
                          {cStep.action[lang]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Execution Guide Block 3: Pro Synergy Tips & Boss Counters */}
              <div className="bg-[#12151E] border border-[#262B38] p-5 sm:p-6 clip-chamfer-sm">
                <h4 className="font-display text-2xl uppercase italic text-white flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-[#D2FF28]" />
                  <span>{t.proTipsTitle}</span>
                </h4>
                <div className="space-y-2.5">
                  {(currentRelicBuild.playGuide?.proTips || []).map((tipObj: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-black/60 border border-[#262B38] p-3.5 flex items-start space-x-3"
                    >
                      <span className="text-[#D2FF28] font-mono-tech font-bold text-xs mt-0.5">
                        [0{idx + 1}]
                      </span>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {tipObj[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (5 Cols, Sticky): BUILD-SPECIFIC VIDEO SHOWCASE MONITOR */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-[#12151E] border-2 border-[#262B38] clip-chamfer overflow-hidden shadow-2xl">
                
                {/* Monitor Top Telemetry Header */}
                <div className="bg-black/90 px-5 py-3.5 border-b border-[#262B38] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Radio
                      className={`w-4 h-4 ${
                        activeBuildVideo ? 'text-[#D2FF28] animate-pulse' : 'text-gray-500'
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#D2FF28]">
                      {t.videoMonitorHeader}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-tech text-[#00F5D4] font-bold">
                    {activeBuildVideo ? activeBuildVideo.patch : 'STANDBY'}
                  </span>
                </div>

                {/* CONDITIONAL RENDERING: If this specific Relic Build has a Video Showcase */}
                {activeBuildVideo ? (
                  <div>
                    {/* Sub-bar showing Boss Cleared & Active Timestamp */}
                    <div className="bg-[#161A25] px-5 py-2.5 border-b border-[#262B38] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech">
                      <span className="bg-[#D2FF28] text-black font-bold px-2 py-0.5 uppercase">
                        {activeBuildVideo.bossTag}
                      </span>
                      <span className="text-[#00F5D4] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {t.playingAt}:{' '}
                          {Math.floor(activeVideoTimestamp / 60)
                            .toString()
                            .padStart(2, '0')}
                          :
                          {(activeVideoTimestamp % 60).toString().padStart(2, '0')} /{' '}
                          {activeBuildVideo.duration}
                        </span>
                      </span>
                    </div>

                    {/* Responsive 16:9 Embedded YouTube Player (Bound to activeBuildVideo + activeVideoTimestamp) */}
                    <div className="relative aspect-video w-full bg-black border-b border-[#262B38]">
                      <iframe
                        key={`${activeBuildVideo.youtubeId}-${activeVideoTimestamp}`}
                        src={`https://www.youtube.com/embed/${activeBuildVideo.youtubeId}?start=${activeVideoTimestamp}&rel=0`}
                        title={activeBuildVideo.title[lang]}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Video Title & Interactive Chapters List */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <div className="text-[10px] font-mono-tech uppercase text-[#8E96AA]">
                          ATTACHED TO: {currentRelicBuild.label[lang]}
                        </div>
                        <h4 className="font-display text-2xl uppercase italic text-white mt-0.5">
                          {activeBuildVideo.title[lang]}
                        </h4>
                      </div>

                      {/* Equipped Relic Pills inside the Video Monitor */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(currentRelicBuild.slots || []).map((s: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono-tech bg-black/80 border border-[#262B38] px-2.5 py-1 text-gray-300 flex items-center gap-1"
                          >
                            <span>{s.icon}</span>
                            <span>{s.name?.[lang] || ''}</span>
                          </span>
                        ))}
                      </div>

                      {/* Clickable Video Chapters (Synced with Turn-by-Turn Combo Steps) */}
                      <div className="pt-3 border-t border-[#262B38]">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-[#00F5D4] mb-2.5 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5" />
                          <span>{t.videoChaptersTitle}</span>
                        </div>
                        <div className="space-y-2">
                          {(activeBuildVideo.chapters || []).map((chap: any, cIdx: number) => {
                            const isChapActive = activeVideoTimestamp === chap.time;
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => setActiveVideoTimestamp(chap.time)}
                                className={`w-full text-left px-3.5 py-2.5 border-l-4 transition flex items-center justify-between gap-3 text-xs ${
                                  isChapActive
                                    ? 'bg-[#1A1F2C] border-[#D2FF28] text-white font-bold'
                                    : 'bg-black/60 border-[#262B38] text-gray-300 hover:border-[#00F5D4] hover:text-white'
                                }`}
                              >
                                <span className="truncate">{chap.title[lang]}</span>
                                <span
                                  className={`font-mono-tech px-2 py-0.5 shrink-0 ${
                                    isChapActive
                                      ? 'bg-[#D2FF28] text-black font-bold'
                                      : 'bg-[#12151E] text-[#00F5D4]'
                                  }`}
                                >
                                  {chap.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* GRACEFUL FALLBACK WHEN A SPECIFIC RELIC BUILD DOES NOT HAVE A VIDEO SHOWCASE */
                  <div className="p-6 space-y-5">
                    <div className="relative h-48 bg-black border border-[#262B38] clip-chamfer-sm overflow-hidden flex flex-col items-center justify-center text-center p-6">
                      <img
                        src={champ.splashLv2}
                        alt={champ.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                      />
                      <div className="relative z-10 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-[#12151E] border border-[#D2FF28]/60 flex items-center justify-center mx-auto text-[#D2FF28]">
                          <VideoOff className="w-6 h-6" />
                        </div>
                        <div className="font-display text-2xl uppercase italic text-white">
                          {t.noVideoTitle}
                        </div>
                        <div className="text-[11px] font-mono-tech text-[#00F5D4]">
                          BUILD ID: {currentRelicBuild.id} // TEXT TELEMETRY MODE
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-black/50 p-4 border-l-4 border-[#D2FF28]">
                      {t.noVideoDesc}
                    </p>

                    {/* Quick Loadout Telemetry Summary Card */}
                    <div className="bg-black/70 border border-[#262B38] p-4 space-y-2.5 font-mono-tech text-xs">
                      <div className="text-[#8E96AA] uppercase">ACTIVE RELIC LOADOUT SUMMARY:</div>
                      {(currentRelicBuild.slots || []).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border-b border-[#262B38]/60 pb-1.5">
                          <span className="text-white">
                            0{idx + 1}. {s.icon} {s.name[lang]}
                          </span>
                          <span className="text-[#D2FF28]">{s.rarity}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setVideoSimMode('ALL_ON')}
                      className="w-full bg-[#D2FF28] hover:bg-white text-black font-display uppercase tracking-wider py-3 text-base transition clip-chamfer-sm flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{t.enableDemoVideoBtn}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 5. STARTING DECK & LEVEL UPGRADE ITEMS ==================== */}
      <section id="starting-deck" className="py-20 border-b border-[#262B38] bg-halftone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-[#00F5D4] font-bold uppercase tracking-widest text-xs sm:text-sm">
                {t.startingDeckSub}
              </div>
              <h2 className="font-display text-5xl sm:text-6xl uppercase italic text-white mt-1">
                {t.startingDeckTitle}
              </h2>
            </div>
            <span className="font-mono-tech text-xs text-[#D2FF28] bg-[#12151E] border border-[#262B38] px-3.5 py-2 clip-chamfer-sm">
              CHAMPION LEVEL 30 MAXED DECK
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 8 Cols: Tactical Card Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(champ.startingDeck || []).map((card: any, idx: number) => {
                const isCardSelected = idx === selectedDeckCardIdx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDeckCardIdx(idx)}
                    className={`cursor-pointer p-4 border-l-4 transition flex items-center space-x-4 clip-chamfer-sm ${
                      isCardSelected
                        ? 'bg-[#1A1F2C] border-[#D2FF28] shadow-[0_0_20px_rgba(210,255,40,0.12)]'
                        : 'bg-[#12151E] border-[#262B38] hover:border-gray-500'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border-2 border-blue-400 flex items-center justify-center font-mono-tech font-bold text-blue-300 shrink-0">
                      {card.cost}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg uppercase tracking-wide text-white truncate">
                        {card.name[lang]}
                      </div>
                      <div className="text-xs text-[#00F5D4] font-semibold truncate mt-0.5">
                        + {card.item[lang]}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#8E96AA] font-mono-tech mt-1">
                        <span>{card.type}</span>
                        <span className="text-[#D2FF28]">{card.unlockLv}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 4 Cols: High-Res LoR Card + Attached PoC Item + Keep/Cut Priority */}
            <div className="lg:col-span-4 bg-[#12151E] border-2 border-[#262B38] p-6 clip-chamfer flex flex-col items-center text-center">
              <div className="text-xs font-mono-tech uppercase tracking-widest text-[#D2FF28] mb-3">
                // CARD & ITEM INSPECTOR
              </div>
              <img
                src={activeDeckCard.img}
                alt={activeDeckCard.name[lang]}
                className="w-48 sm:w-56 h-auto drop-shadow-[0_12px_25px_rgba(0,0,0,0.9)] hover:scale-105 transition duration-300"
              />
              <h3 className="font-display text-2xl uppercase italic text-white mt-4">
                {activeDeckCard.name[lang]}
              </h3>

              <div className="mt-3 w-full bg-black/70 border border-[#00F5D4]/50 p-3 clip-chamfer-sm">
                <div className="text-[10px] font-mono-tech uppercase text-[#00F5D4]">
                  ATTACHED LEVEL UPGRADE ({activeDeckCard.unlockLv})
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">
                  {activeDeckCard.item[lang]}
                </div>
              </div>

              {activeDeckCard.keepPriority && (
                <div className="mt-2.5 w-full bg-black/70 border border-[#D2FF28]/50 p-2.5 clip-chamfer-sm">
                  <div className="text-[10px] font-mono-tech uppercase text-[#D2FF28]">
                    MULLIGAN / HEALER NODE PRIORITY
                  </div>
                  <div className="text-xs font-bold text-gray-200 mt-0.5">
                    {activeDeckCard.keepPriority[lang]}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. ADVENTURE SYNERGIES & COMMUNITY RATINGS ==================== */}
      <section id="synergies" className="py-20 border-b border-[#262B38] bg-hazard-stripes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Best Powers & Support Champions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#12151E] border border-[#262B38] p-6 clip-chamfer-sm">
              <h3 className="font-display text-2xl uppercase italic text-[#D2FF28] mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {t.bestPowers}
              </h3>
              <div className="space-y-3">
                {(champ.recommendations?.powers || []).map((pw: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-black/60 border border-[#262B38] p-3.5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-white text-sm uppercase">
                        {pw.name[lang]}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{pw.desc[lang]}</div>
                    </div>
                    <span className="text-[10px] font-mono-tech font-bold px-2 py-0.5 bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shrink-0">
                      {pw.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#12151E] border border-[#262B38] p-6 clip-chamfer-sm">
              <h3 className="font-display text-2xl uppercase italic text-[#00F5D4] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t.bestSupports}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(champ.recommendations?.supportChamps || []).map((sup: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-black/60 border border-[#262B38] p-3.5 hover:border-[#00F5D4] transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg uppercase text-white">
                        {sup.name}
                      </span>
                      <span className="text-[10px] font-mono-tech text-[#8E96AA]">
                        {sup.region}
                      </span>
                    </div>
                    <div className="text-xs text-[#D2FF28] mt-1 font-medium">
                      {sup.synergy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Community Build Reviews (Adapted from CommunityRatingsList.jsx) */}
          <div className="bg-[#12151E] border border-[#262B38] p-6 sm:p-8 clip-chamfer">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="font-display text-3xl uppercase italic text-white flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-[#D2FF28]" />
                <span>{t.communityTitle}</span>
              </h3>
              <span className="text-xs font-mono-tech text-[#00F5D4]">
                VERIFIED 6.5★ NIGHTMARE CLEARS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(champ.communityRatings || []).map((rev: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-black/60 border border-[#262B38] p-5 clip-chamfer-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg uppercase text-[#D2FF28]">
                      {rev.user}
                    </span>
                    <span className="font-mono-tech text-xs bg-[#D2FF28] text-black font-bold px-2 py-0.5">
                      {rev.rating}/10 // {rev.stars}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-tech text-[#00F5D4]">
                    BUILD: {rev.loadoutUsed}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    "{rev.comment[lang]}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 7. EXPLORE MORE FIGHTERS (ROSTER GRID) ==================== */}
      <section id="roster" className="py-20 border-b border-[#262B38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-[#D2FF28] font-bold uppercase tracking-widest text-xs sm:text-sm">
                // SELECT YOUR NEXT PATH OF CHAMPIONS DUELIST
              </div>
              <h2 className="font-display text-5xl sm:text-6xl uppercase italic text-white mt-1">
                {t.exploreFighters}
              </h2>
            </div>

            <button
              onClick={handleCopyIntegration}
              className="inline-flex items-center space-x-2 bg-[#12151E] border border-[#262B38] hover:border-[#D2FF28] px-5 py-2.5 text-xs font-mono-tech uppercase tracking-wider text-white hover:text-[#D2FF28] transition clip-chamfer-sm"
            >
              {copiedRepoNote ? (
                <>
                  <Check className="w-4 h-4 text-[#D2FF28]" />
                  <span>COPIED REPO INTEGRATION SCHEMA!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY BUILD + VIDEO SCHEMA NOTE</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {ROSTER_PREVIEW.map((fighter: any) => {
              const isCurrent = fighter.id === activeChampKey;
              return (
                <button
                  key={fighter.id}
                  onClick={() => {
                    if (fighter.playableInDemo) {
                      setActiveChampKey(fighter.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`group relative h-40 bg-[#12151E] border text-left clip-chamfer-sm overflow-hidden transition ${
                    isCurrent
                      ? 'border-[#D2FF28] shadow-[0_0_20px_rgba(210,255,40,0.25)]'
                      : fighter.playableInDemo
                      ? 'border-[#262B38] hover:border-[#00F5D4] cursor-pointer'
                      : 'border-[#262B38]/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <img
                    src={fighter.img}
                    alt={fighter.name}
                    className="w-full h-full object-cover object-center opacity-55 group-hover:opacity-90 group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <span
                    className={`absolute top-2 right-2 text-[10px] font-mono-tech font-bold uppercase px-1.5 py-0.5 ${
                      isCurrent
                        ? 'bg-[#D2FF28] text-black'
                        : fighter.playableInDemo
                        ? 'bg-[#00F5D4] text-black'
                        : 'bg-black/80 text-gray-400'
                    }`}
                  >
                    {isCurrent ? 'VIEWING' : fighter.playableInDemo ? 'CLICK DEMO' : fighter.stars}
                  </span>

                  <div className="absolute bottom-2 left-2.5 right-2">
                    <div
                      className={`font-display text-lg uppercase italic tracking-wide transition ${
                        isCurrent ? 'text-[#D2FF28]' : 'text-white group-hover:text-[#D2FF28]'
                      }`}
                    >
                      {fighter.name}
                    </div>
                    <div className="text-[10px] text-gray-300 truncate">{fighter.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
