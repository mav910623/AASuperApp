import type { Section, Tool, TeamCalendar } from '@/types/app';

export const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'cebbb725-ce7c-43c6-8d33-ea19d948bae0',
    slug: 'prospecting',
    icon_name: 'UserPlus',
    sort_order: 1,
    is_visible: true,
    title: {
      en: 'Prospecting',
      bm: 'Prospek',
      cn: '开发市场',
      ta: 'வாய்ப்புகள்',
    },
    description: {
      en: 'Short openers & videos to spark interest',
      bm: 'Video pendek & ayat pembuka minat',
      cn: '引起兴趣的短视频与开场白',
      ta: 'ஆர்வத்தைத் தூண்டும் குறுகிய காணொளிகள்',
    },
  },
  {
    id: '8305a7da-8972-4cc7-a44e-b2d9e1faaa35',
    slug: 'onboarding',
    icon_name: 'Rocket',
    sort_order: 2,
    is_visible: true,
    title: {
      en: 'Onboarding',
      bm: 'Permulaan Baru',
      cn: '新人起步',
      ta: 'புதிய தொடக்கம்',
    },
    description: {
      en: 'Step-by-step launch guide for new partners',
      bm: 'Langkah pertama untuk rakan baru',
      cn: '新伙伴快速上手指南',
      ta: 'புதிய கூட்டாளர்களுக்கான வழிகாட்டி',
    },
  },
  {
    id: 'c651a8d7-b7d4-4092-bc12-791d0e6a0d19',
    slug: 'skillset',
    icon_name: 'Award',
    sort_order: 3,
    is_visible: true,
    title: {
      en: 'Skillset',
      bm: 'Kemahiran',
      cn: '实战技巧',
      ta: 'திறன்கள்',
    },
    description: {
      en: 'Audio trainings, closing & mindset mastery',
      bm: 'Latihan audio, teknik closing & mindset',
      cn: '实战录音、成交技巧与心态培训',
      ta: 'ஆடியோ பயிற்சி மற்றும் மனநிலை',
    },
  },
  {
    id: '96ce3f3b-284f-49a4-b5c1-9672d535149e',
    slug: 'product',
    icon_name: 'Sparkles',
    sort_order: 4,
    is_visible: true,
    title: {
      en: 'Product',
      bm: 'Produk',
      cn: '产品资讯',
      ta: 'தயாரிப்புகள்',
    },
    description: {
      en: 'Catalogs, science guides & testimonials',
      bm: 'Katalog, panduan produk & testimoni',
      cn: '产品目录、科研指南与见证',
      ta: 'தயாரிப்பு வழிகாட்டிகள் மற்றும் சான்றுகள்',
    },
  },
];

export const DEFAULT_TOOLS: Tool[] = [
  {
    "id": "tool-wow",
    "section_id": "cebbb725-ce7c-43c6-8d33-ea19d948bae0",
    "type": "youtube",
    "title": {
      "en": "W.O.W (KL) - COEV Rayne",
      "bm": "W.O.W (KL) - COEV Rayne",
      "cn": "W.O.W (KL) - COEV Rayne",
      "ta": "W.O.W (KL) - COEV Rayne"
    },
    "description": {
      "en": "Official AA Team duplication resource: W.O.W (KL) - COEV Rayne",
      "bm": "Sumber latihan duplikasi rasmi AA Team: W.O.W (KL) - COEV Rayne",
      "cn": "AA 团队系统倍增核心资料：W.O.W (KL) - COEV Rayne",
      "ta": ""
    },
    "speaker_name": "COEV Rayne",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "COEV Rayne"
      ],
      "bm": [
        "COEV Rayne"
      ],
      "cn": [
        "COEV Rayne"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/xEjv9DB6HEM",
      "bm": "https://youtu.be/xEjv9DB6HEM",
      "cn": "https://youtu.be/xEjv9DB6HEM",
      "ta": "https://youtu.be/xEjv9DB6HEM"
    },
    "whatsapp_script": {
      "en": "Check out \"W.O.W (KL) - COEV Rayne\" by COEV Rayne:",
      "bm": "Tonton \"W.O.W (KL) - COEV Rayne\" oleh COEV Rayne:",
      "cn": "推荐学习《W.O.W (KL) - COEV Rayne》主讲：COEV Rayne：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": true,
    "sort_order": 1,
    "is_visible": true
  },
  {
    "id": "tool-copycat",
    "section_id": "cebbb725-ce7c-43c6-8d33-ea19d948bae0",
    "type": "youtube",
    "title": {
      "en": "Copycat Marketing",
      "bm": "Copycat Marketing",
      "cn": "Copycat Marketing",
      "ta": "Copycat Marketing"
    },
    "description": {
      "en": "Official AA Team duplication resource: Copycat Marketing",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Copycat Marketing",
      "cn": "AA 团队系统倍增核心资料：Copycat Marketing",
      "ta": ""
    },
    "speaker_name": "AA Team",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "AA Team"
      ],
      "bm": [
        "AA Team"
      ],
      "cn": [
        "AA Team"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/UJkZIH3OHbo",
      "bm": "https://youtu.be/UJkZIH3OHbo",
      "cn": "https://youtu.be/UJkZIH3OHbo",
      "ta": "https://youtu.be/UJkZIH3OHbo"
    },
    "whatsapp_script": {
      "en": "Check out \"Copycat Marketing\" by AA Team:",
      "bm": "Tonton \"Copycat Marketing\" oleh AA Team:",
      "cn": "推荐学习《Copycat Marketing》主讲：AA Team：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 2,
    "is_visible": true
  },
  {
    "id": "tool-pipeline",
    "section_id": "cebbb725-ce7c-43c6-8d33-ea19d948bae0",
    "type": "youtube",
    "title": {
      "en": "Parable of Pipeline",
      "bm": "Parable of Pipeline",
      "cn": "Parable of Pipeline",
      "ta": "Parable of Pipeline"
    },
    "description": {
      "en": "Official AA Team duplication resource: Parable of Pipeline",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Parable of Pipeline",
      "cn": "AA 团队系统倍增核心资料：Parable of Pipeline",
      "ta": ""
    },
    "speaker_name": "AA Team",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "AA Team"
      ],
      "bm": [
        "AA Team"
      ],
      "cn": [
        "AA Team"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/vvlsVBL_Ovk",
      "bm": "https://youtu.be/vvlsVBL_Ovk",
      "cn": "https://youtu.be/vvlsVBL_Ovk",
      "ta": "https://youtu.be/vvlsVBL_Ovk"
    },
    "whatsapp_script": {
      "en": "Check out \"Parable of Pipeline\" by AA Team:",
      "bm": "Tonton \"Parable of Pipeline\" oleh AA Team:",
      "cn": "推荐学习《Parable of Pipeline》主讲：AA Team：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 3,
    "is_visible": true
  },
  {
    "id": "tool-prysm",
    "section_id": "cebbb725-ce7c-43c6-8d33-ea19d948bae0",
    "type": "youtube",
    "title": {
      "en": "How to present PRYSM business opportunity - Ashley",
      "bm": "How to present PRYSM business opportunity - Ashley",
      "cn": "How to present PRYSM business opportunity - Ashley",
      "ta": "How to present PRYSM business opportunity - Ashley"
    },
    "description": {
      "en": "Official AA Team duplication resource: How to present PRYSM business opportunity - Ashley",
      "bm": "Sumber latihan duplikasi rasmi AA Team: How to present PRYSM business opportunity - Ashley",
      "cn": "AA 团队系统倍增核心资料：How to present PRYSM business opportunity - Ashley",
      "ta": ""
    },
    "speaker_name": "Ashley",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Ashley"
      ],
      "bm": [
        "Ashley"
      ],
      "cn": [
        "Ashley"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/IskgeQIaHQ",
      "bm": "https://youtu.be/IskgeQIaHQ",
      "cn": "https://youtu.be/IskgeQIaHQ",
      "ta": "https://youtu.be/IskgeQIaHQ"
    },
    "whatsapp_script": {
      "en": "Check out \"How to present PRYSM business opportunity - Ashley\" by Ashley:",
      "bm": "Tonton \"How to present PRYSM business opportunity - Ashley\" oleh Ashley:",
      "cn": "推荐学习《How to present PRYSM business opportunity - Ashley》主讲：Ashley：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 4,
    "is_visible": true
  },
  {
    "id": "tool-school",
    "section_id": "8305a7da-8972-4cc7-a44e-b2d9e1faaa35",
    "type": "pdf",
    "title": {
      "en": "The Business School (PDF) - Robert Kiyosaki",
      "bm": "The Business School (PDF) - Robert Kiyosaki",
      "cn": "The Business School (PDF) - Robert Kiyosaki",
      "ta": "The Business School (PDF) - Robert Kiyosaki"
    },
    "description": {
      "en": "Official AA Team duplication resource: The Business School (PDF) - Robert Kiyosaki",
      "bm": "Sumber latihan duplikasi rasmi AA Team: The Business School (PDF) - Robert Kiyosaki",
      "cn": "AA 团队系统倍增核心资料：The Business School (PDF) - Robert Kiyosaki",
      "ta": ""
    },
    "speaker_name": "Robert Kiyosaki",
    "duration": "📄 PDF Guide",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Robert Kiyosaki"
      ],
      "bm": [
        "Robert Kiyosaki"
      ],
      "cn": [
        "Robert Kiyosaki"
      ],
      "ta": []
    },
    "url": {
      "en": "https://drive.google.com/file/d/1TL49UZax0mdLScUIKyvmS0e1kbtiH4xl/view?usp=drivesdk",
      "bm": "https://drive.google.com/file/d/1TL49UZax0mdLScUIKyvmS0e1kbtiH4xl/view?usp=drivesdk",
      "cn": "https://drive.google.com/file/d/1TL49UZax0mdLScUIKyvmS0e1kbtiH4xl/view?usp=drivesdk",
      "ta": "https://drive.google.com/file/d/1TL49UZax0mdLScUIKyvmS0e1kbtiH4xl/view?usp=drivesdk"
    },
    "whatsapp_script": {
      "en": "Check out \"The Business School (PDF) - Robert Kiyosaki\" by Robert Kiyosaki:",
      "bm": "Tonton \"The Business School (PDF) - Robert Kiyosaki\" oleh Robert Kiyosaki:",
      "cn": "推荐学习《The Business School (PDF) - Robert Kiyosaki》主讲：Robert Kiyosaki：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": true,
    "sort_order": 5,
    "is_visible": true
  },
  {
    "id": "tool-esbi",
    "section_id": "8305a7da-8972-4cc7-a44e-b2d9e1faaa35",
    "type": "soundcloud",
    "title": {
      "en": "ESBI Audio - Robert Kiyosaki",
      "bm": "ESBI Audio - Robert Kiyosaki",
      "cn": "ESBI Audio - Robert Kiyosaki",
      "ta": "ESBI Audio - Robert Kiyosaki"
    },
    "description": {
      "en": "Official AA Team duplication resource: ESBI Audio - Robert Kiyosaki",
      "bm": "Sumber latihan duplikasi rasmi AA Team: ESBI Audio - Robert Kiyosaki",
      "cn": "AA 团队系统倍增核心资料：ESBI Audio - Robert Kiyosaki",
      "ta": ""
    },
    "speaker_name": "Robert Kiyosaki",
    "duration": "🎧 Audio",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Robert Kiyosaki"
      ],
      "bm": [
        "Robert Kiyosaki"
      ],
      "cn": [
        "Robert Kiyosaki"
      ],
      "ta": []
    },
    "url": {
      "en": "https://on.soundcloud.com/7YSOYUVPHAOMMYA2N",
      "bm": "https://on.soundcloud.com/7YSOYUVPHAOMMYA2N",
      "cn": "https://on.soundcloud.com/7YSOYUVPHAOMMYA2N",
      "ta": "https://on.soundcloud.com/7YSOYUVPHAOMMYA2N"
    },
    "whatsapp_script": {
      "en": "Check out \"ESBI Audio - Robert Kiyosaki\" by Robert Kiyosaki:",
      "bm": "Tonton \"ESBI Audio - Robert Kiyosaki\" oleh Robert Kiyosaki:",
      "cn": "推荐学习《ESBI Audio - Robert Kiyosaki》主讲：Robert Kiyosaki：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 6,
    "is_visible": true
  },
  {
    "id": "tool-start",
    "section_id": "8305a7da-8972-4cc7-a44e-b2d9e1faaa35",
    "type": "youtube",
    "title": {
      "en": "How to Get Started - Bao Yan",
      "bm": "How to Get Started - Bao Yan",
      "cn": "How to Get Started - Bao Yan",
      "ta": "How to Get Started - Bao Yan"
    },
    "description": {
      "en": "Official AA Team duplication resource: How to Get Started - Bao Yan",
      "bm": "Sumber latihan duplikasi rasmi AA Team: How to Get Started - Bao Yan",
      "cn": "AA 团队系统倍增核心资料：How to Get Started - Bao Yan",
      "ta": ""
    },
    "speaker_name": "Bao Yan",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Bao Yan"
      ],
      "bm": [
        "Bao Yan"
      ],
      "cn": [
        "Bao Yan"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/j9iOilXwzJc",
      "bm": "https://youtu.be/j9iOilXwzJc",
      "cn": "https://youtu.be/j9iOilXwzJc",
      "ta": "https://youtu.be/j9iOilXwzJc"
    },
    "whatsapp_script": {
      "en": "Check out \"How to Get Started - Bao Yan\" by Bao Yan:",
      "bm": "Tonton \"How to Get Started - Bao Yan\" oleh Bao Yan:",
      "cn": "推荐学习《How to Get Started - Bao Yan》主讲：Bao Yan：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 7,
    "is_visible": true
  },
  {
    "id": "tool-nu-ent",
    "section_id": "8305a7da-8972-4cc7-a44e-b2d9e1faaa35",
    "type": "youtube",
    "title": {
      "en": "Nu Entrepreneur Training - COEV Rayne",
      "bm": "Nu Entrepreneur Training - COEV Rayne",
      "cn": "Nu Entrepreneur Training - COEV Rayne",
      "ta": "Nu Entrepreneur Training - COEV Rayne"
    },
    "description": {
      "en": "Official AA Team duplication resource: Nu Entrepreneur Training - COEV Rayne",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Nu Entrepreneur Training - COEV Rayne",
      "cn": "AA 团队系统倍增核心资料：Nu Entrepreneur Training - COEV Rayne",
      "ta": ""
    },
    "speaker_name": "COEV Rayne",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "COEV Rayne"
      ],
      "bm": [
        "COEV Rayne"
      ],
      "cn": [
        "COEV Rayne"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/TzN8bhjy304",
      "bm": "https://youtu.be/TzN8bhjy304",
      "cn": "https://youtu.be/TzN8bhjy304",
      "ta": "https://youtu.be/TzN8bhjy304"
    },
    "whatsapp_script": {
      "en": "Check out \"Nu Entrepreneur Training - COEV Rayne\" by COEV Rayne:",
      "bm": "Tonton \"Nu Entrepreneur Training - COEV Rayne\" oleh COEV Rayne:",
      "cn": "推荐学习《Nu Entrepreneur Training - COEV Rayne》主讲：COEV Rayne：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 8,
    "is_visible": true
  },
  {
    "id": "tool-abc-sel",
    "section_id": "c651a8d7-b7d4-4092-bc12-791d0e6a0d19",
    "type": "youtube",
    "title": {
      "en": "How to do Well in ABC - Selenium",
      "bm": "How to do Well in ABC - Selenium",
      "cn": "How to do Well in ABC - Selenium",
      "ta": "How to do Well in ABC - Selenium"
    },
    "description": {
      "en": "Official AA Team duplication resource: How to do Well in ABC - Selenium",
      "bm": "Sumber latihan duplikasi rasmi AA Team: How to do Well in ABC - Selenium",
      "cn": "AA 团队系统倍增核心资料：How to do Well in ABC - Selenium",
      "ta": ""
    },
    "speaker_name": "Selenium",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Selenium"
      ],
      "bm": [
        "Selenium"
      ],
      "cn": [
        "Selenium"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/ZQSPQ-BW4A",
      "bm": "https://youtu.be/ZQSPQ-BW4A",
      "cn": "https://youtu.be/ZQSPQ-BW4A",
      "ta": "https://youtu.be/ZQSPQ-BW4A"
    },
    "whatsapp_script": {
      "en": "Check out \"How to do Well in ABC - Selenium\" by Selenium:",
      "bm": "Tonton \"How to do Well in ABC - Selenium\" oleh Selenium:",
      "cn": "推荐学习《How to do Well in ABC - Selenium》主讲：Selenium：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": true,
    "sort_order": 9,
    "is_visible": true
  },
  {
    "id": "tool-abc-gav",
    "section_id": "c651a8d7-b7d4-4092-bc12-791d0e6a0d19",
    "type": "youtube",
    "title": {
      "en": "ABC 法则 - Gavin",
      "bm": "ABC 法则 - Gavin",
      "cn": "ABC 法则 - Gavin",
      "ta": "ABC 法则 - Gavin"
    },
    "description": {
      "en": "Official AA Team duplication resource: ABC 法则 - Gavin",
      "bm": "Sumber latihan duplikasi rasmi AA Team: ABC 法则 - Gavin",
      "cn": "AA 团队系统倍增核心资料：ABC 法则 - Gavin",
      "ta": ""
    },
    "speaker_name": "Gavin",
    "duration": "",
    "available_languages": [
      "cn"
    ],
    "topics": {
      "en": [
        "Gavin"
      ],
      "bm": [
        "Gavin"
      ],
      "cn": [
        "Gavin"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/BMFsmlI3XO0",
      "bm": "https://youtu.be/BMFsmlI3XO0",
      "cn": "https://youtu.be/BMFsmlI3XO0",
      "ta": "https://youtu.be/BMFsmlI3XO0"
    },
    "whatsapp_script": {
      "en": "Check out \"ABC 法则 - Gavin\" by Gavin:",
      "bm": "Tonton \"ABC 法则 - Gavin\" oleh Gavin:",
      "cn": "推荐学习《ABC 法则 - Gavin》主讲：Gavin：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 10,
    "is_visible": true
  },
  {
    "id": "tool-close-car",
    "section_id": "c651a8d7-b7d4-4092-bc12-791d0e6a0d19",
    "type": "youtube",
    "title": {
      "en": "Closing Master Class - Carolyn",
      "bm": "Closing Master Class - Carolyn",
      "cn": "Closing Master Class - Carolyn",
      "ta": "Closing Master Class - Carolyn"
    },
    "description": {
      "en": "Official AA Team duplication resource: Closing Master Class - Carolyn",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Closing Master Class - Carolyn",
      "cn": "AA 团队系统倍增核心资料：Closing Master Class - Carolyn",
      "ta": ""
    },
    "speaker_name": "Carolyn",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Carolyn"
      ],
      "bm": [
        "Carolyn"
      ],
      "cn": [
        "Carolyn"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/9emM3yN8Udg",
      "bm": "https://youtu.be/9emM3yN8Udg",
      "cn": "https://youtu.be/9emM3yN8Udg",
      "ta": "https://youtu.be/9emM3yN8Udg"
    },
    "whatsapp_script": {
      "en": "Check out \"Closing Master Class - Carolyn\" by Carolyn:",
      "bm": "Tonton \"Closing Master Class - Carolyn\" oleh Carolyn:",
      "cn": "推荐学习《Closing Master Class - Carolyn》主讲：Carolyn：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 11,
    "is_visible": true
  },
  {
    "id": "tool-30-nos",
    "section_id": "c651a8d7-b7d4-4092-bc12-791d0e6a0d19",
    "type": "youtube",
    "title": {
      "en": "How to handle 30 NOs to YES - Haylane",
      "bm": "How to handle 30 NOs to YES - Haylane",
      "cn": "How to handle 30 NOs to YES - Haylane",
      "ta": "How to handle 30 NOs to YES - Haylane"
    },
    "description": {
      "en": "Official AA Team duplication resource: How to handle 30 NOs to YES - Haylane",
      "bm": "Sumber latihan duplikasi rasmi AA Team: How to handle 30 NOs to YES - Haylane",
      "cn": "AA 团队系统倍增核心资料：How to handle 30 NOs to YES - Haylane",
      "ta": ""
    },
    "speaker_name": "Haylane",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Haylane"
      ],
      "bm": [
        "Haylane"
      ],
      "cn": [
        "Haylane"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/omTySVXznnk",
      "bm": "https://youtu.be/omTySVXznnk",
      "cn": "https://youtu.be/omTySVXznnk",
      "ta": "https://youtu.be/omTySVXznnk"
    },
    "whatsapp_script": {
      "en": "Check out \"How to handle 30 NOs to YES - Haylane\" by Haylane:",
      "bm": "Tonton \"How to handle 30 NOs to YES - Haylane\" oleh Haylane:",
      "cn": "推荐学习《How to handle 30 NOs to YES - Haylane》主讲：Haylane：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 12,
    "is_visible": true
  },
  {
    "id": "tool-g3-e",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "G3 Juice (E) - Renee",
      "bm": "G3 Juice (E) - Renee",
      "cn": "G3 Juice (E) - Renee",
      "ta": "G3 Juice (E) - Renee"
    },
    "description": {
      "en": "Official AA Team duplication resource: G3 Juice (E) - Renee",
      "bm": "Sumber latihan duplikasi rasmi AA Team: G3 Juice (E) - Renee",
      "cn": "AA 团队系统倍增核心资料：G3 Juice (E) - Renee",
      "ta": ""
    },
    "speaker_name": "Renee",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Renee"
      ],
      "bm": [
        "Renee"
      ],
      "cn": [
        "Renee"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/l6p-j-JOWKM",
      "bm": "https://youtu.be/l6p-j-JOWKM",
      "cn": "https://youtu.be/l6p-j-JOWKM",
      "ta": "https://youtu.be/l6p-j-JOWKM"
    },
    "whatsapp_script": {
      "en": "Check out \"G3 Juice (E) - Renee\" by Renee:",
      "bm": "Tonton \"G3 Juice (E) - Renee\" oleh Renee:",
      "cn": "推荐学习《G3 Juice (E) - Renee》主讲：Renee：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": true,
    "sort_order": 13,
    "is_visible": true
  },
  {
    "id": "tool-g3-c",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "G3 Juice (C) - Emily",
      "bm": "G3 Juice (C) - Emily",
      "cn": "G3 Juice (C) - Emily",
      "ta": "G3 Juice (C) - Emily"
    },
    "description": {
      "en": "Official AA Team duplication resource: G3 Juice (C) - Emily",
      "bm": "Sumber latihan duplikasi rasmi AA Team: G3 Juice (C) - Emily",
      "cn": "AA 团队系统倍增核心资料：G3 Juice (C) - Emily",
      "ta": ""
    },
    "speaker_name": "Emily",
    "duration": "",
    "available_languages": [
      "cn"
    ],
    "topics": {
      "en": [
        "Emily"
      ],
      "bm": [
        "Emily"
      ],
      "cn": [
        "Emily"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/gZxNzThZzVA",
      "bm": "https://youtu.be/gZxNzThZzVA",
      "cn": "https://youtu.be/gZxNzThZzVA",
      "ta": "https://youtu.be/gZxNzThZzVA"
    },
    "whatsapp_script": {
      "en": "Check out \"G3 Juice (C) - Emily\" by Emily:",
      "bm": "Tonton \"G3 Juice (C) - Emily\" oleh Emily:",
      "cn": "推荐学习《G3 Juice (C) - Emily》主讲：Emily：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 14,
    "is_visible": true
  },
  {
    "id": "tool-col-c",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "Inner Beauty Collagen Plus (C) - Joni",
      "bm": "Inner Beauty Collagen Plus (C) - Joni",
      "cn": "Inner Beauty Collagen Plus (C) - Joni",
      "ta": "Inner Beauty Collagen Plus (C) - Joni"
    },
    "description": {
      "en": "Official AA Team duplication resource: Inner Beauty Collagen Plus (C) - Joni",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Inner Beauty Collagen Plus (C) - Joni",
      "cn": "AA 团队系统倍增核心资料：Inner Beauty Collagen Plus (C) - Joni",
      "ta": ""
    },
    "speaker_name": "Joni",
    "duration": "",
    "available_languages": [
      "cn"
    ],
    "topics": {
      "en": [
        "Joni"
      ],
      "bm": [
        "Joni"
      ],
      "cn": [
        "Joni"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/SScpF43LBZY",
      "bm": "https://youtu.be/SScpF43LBZY",
      "cn": "https://youtu.be/SScpF43LBZY",
      "ta": "https://youtu.be/SScpF43LBZY"
    },
    "whatsapp_script": {
      "en": "Check out \"Inner Beauty Collagen Plus (C) - Joni\" by Joni:",
      "bm": "Tonton \"Inner Beauty Collagen Plus (C) - Joni\" oleh Joni:",
      "cn": "推荐学习《Inner Beauty Collagen Plus (C) - Joni》主讲：Joni：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 15,
    "is_visible": true
  },
  {
    "id": "tool-col-e",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "Inner Beauty Collagen Plus (E) - Nigel",
      "bm": "Inner Beauty Collagen Plus (E) - Nigel",
      "cn": "Inner Beauty Collagen Plus (E) - Nigel",
      "ta": "Inner Beauty Collagen Plus (E) - Nigel"
    },
    "description": {
      "en": "Official AA Team duplication resource: Inner Beauty Collagen Plus (E) - Nigel",
      "bm": "Sumber latihan duplikasi rasmi AA Team: Inner Beauty Collagen Plus (E) - Nigel",
      "cn": "AA 团队系统倍增核心资料：Inner Beauty Collagen Plus (E) - Nigel",
      "ta": ""
    },
    "speaker_name": "Nigel",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Nigel"
      ],
      "bm": [
        "Nigel"
      ],
      "cn": [
        "Nigel"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/Ip6MehUJTIo",
      "bm": "https://youtu.be/Ip6MehUJTIo",
      "cn": "https://youtu.be/Ip6MehUJTIo",
      "ta": "https://youtu.be/Ip6MehUJTIo"
    },
    "whatsapp_script": {
      "en": "Check out \"Inner Beauty Collagen Plus (E) - Nigel\" by Nigel:",
      "bm": "Tonton \"Inner Beauty Collagen Plus (E) - Nigel\" oleh Nigel:",
      "cn": "推荐学习《Inner Beauty Collagen Plus (E) - Nigel》主讲：Nigel：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 16,
    "is_visible": true
  },
  {
    "id": "tool-ys-c",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "You-Span (C) - Soo Hui",
      "bm": "You-Span (C) - Soo Hui",
      "cn": "You-Span (C) - Soo Hui",
      "ta": "You-Span (C) - Soo Hui"
    },
    "description": {
      "en": "Official AA Team duplication resource: You-Span (C) - Soo Hui",
      "bm": "Sumber latihan duplikasi rasmi AA Team: You-Span (C) - Soo Hui",
      "cn": "AA 团队系统倍增核心资料：You-Span (C) - Soo Hui",
      "ta": ""
    },
    "speaker_name": "Soo Hui",
    "duration": "",
    "available_languages": [
      "cn"
    ],
    "topics": {
      "en": [
        "Soo Hui"
      ],
      "bm": [
        "Soo Hui"
      ],
      "cn": [
        "Soo Hui"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/aiOSdLDU2DY",
      "bm": "https://youtu.be/aiOSdLDU2DY",
      "cn": "https://youtu.be/aiOSdLDU2DY",
      "ta": "https://youtu.be/aiOSdLDU2DY"
    },
    "whatsapp_script": {
      "en": "Check out \"You-Span (C) - Soo Hui\" by Soo Hui:",
      "bm": "Tonton \"You-Span (C) - Soo Hui\" oleh Soo Hui:",
      "cn": "推荐学习《You-Span (C) - Soo Hui》主讲：Soo Hui：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 17,
    "is_visible": true
  },
  {
    "id": "tool-ys-e",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "You-Span (E) - Mikaela",
      "bm": "You-Span (E) - Mikaela",
      "cn": "You-Span (E) - Mikaela",
      "ta": "You-Span (E) - Mikaela"
    },
    "description": {
      "en": "Official AA Team duplication resource: You-Span (E) - Mikaela",
      "bm": "Sumber latihan duplikasi rasmi AA Team: You-Span (E) - Mikaela",
      "cn": "AA 团队系统倍增核心资料：You-Span (E) - Mikaela",
      "ta": ""
    },
    "speaker_name": "Mikaela",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Mikaela"
      ],
      "bm": [
        "Mikaela"
      ],
      "cn": [
        "Mikaela"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/hPJEox2qSeE",
      "bm": "https://youtu.be/hPJEox2qSeE",
      "cn": "https://youtu.be/hPJEox2qSeE",
      "ta": "https://youtu.be/hPJEox2qSeE"
    },
    "whatsapp_script": {
      "en": "Check out \"You-Span (E) - Mikaela\" by Mikaela:",
      "bm": "Tonton \"You-Span (E) - Mikaela\" oleh Mikaela:",
      "cn": "推荐学习《You-Span (E) - Mikaela》主讲：Mikaela：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 18,
    "is_visible": true
  },
  {
    "id": "tool-trme-e",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "TRME (E) - Shireen",
      "bm": "TRME (E) - Shireen",
      "cn": "TRME (E) - Shireen",
      "ta": "TRME (E) - Shireen"
    },
    "description": {
      "en": "Official AA Team duplication resource: TRME (E) - Shireen",
      "bm": "Sumber latihan duplikasi rasmi AA Team: TRME (E) - Shireen",
      "cn": "AA 团队系统倍增核心资料：TRME (E) - Shireen",
      "ta": ""
    },
    "speaker_name": "Shireen",
    "duration": "",
    "available_languages": [
      "en"
    ],
    "topics": {
      "en": [
        "Shireen"
      ],
      "bm": [
        "Shireen"
      ],
      "cn": [
        "Shireen"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/fH5HKjQQPVk",
      "bm": "https://youtu.be/fH5HKjQQPVk",
      "cn": "https://youtu.be/fH5HKjQQPVk",
      "ta": "https://youtu.be/fH5HKjQQPVk"
    },
    "whatsapp_script": {
      "en": "Check out \"TRME (E) - Shireen\" by Shireen:",
      "bm": "Tonton \"TRME (E) - Shireen\" oleh Shireen:",
      "cn": "推荐学习《TRME (E) - Shireen》主讲：Shireen：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 19,
    "is_visible": true
  },
  {
    "id": "tool-trme-c",
    "section_id": "96ce3f3b-284f-49a4-b5c1-9672d535149e",
    "type": "youtube",
    "title": {
      "en": "TRME (C) - Chee Chai",
      "bm": "TRME (C) - Chee Chai",
      "cn": "TRME (C) - Chee Chai",
      "ta": "TRME (C) - Chee Chai"
    },
    "description": {
      "en": "Official AA Team duplication resource: TRME (C) - Chee Chai",
      "bm": "Sumber latihan duplikasi rasmi AA Team: TRME (C) - Chee Chai",
      "cn": "AA 团队系统倍增核心资料：TRME (C) - Chee Chai",
      "ta": ""
    },
    "speaker_name": "Chee Chai",
    "duration": "",
    "available_languages": [
      "cn"
    ],
    "topics": {
      "en": [
        "Chee Chai"
      ],
      "bm": [
        "Chee Chai"
      ],
      "cn": [
        "Chee Chai"
      ],
      "ta": []
    },
    "url": {
      "en": "https://youtu.be/WZ95M30qlgY",
      "bm": "https://youtu.be/WZ95M30qlgY",
      "cn": "https://youtu.be/WZ95M30qlgY",
      "ta": "https://youtu.be/WZ95M30qlgY"
    },
    "whatsapp_script": {
      "en": "Check out \"TRME (C) - Chee Chai\" by Chee Chai:",
      "bm": "Tonton \"TRME (C) - Chee Chai\" oleh Chee Chai:",
      "cn": "推荐学习《TRME (C) - Chee Chai》主讲：Chee Chai：",
      "ta": ""
    },
    "thumbnail_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "is_featured": false,
    "sort_order": 20,
    "is_visible": true
  }
];

export const DEFAULT_CALENDAR: TeamCalendar = {
  id: "1",
  month_label: {
    en: "Team Calendar & Monthly Schedule",
    bm: "Jadual & Kalendar Bulanan Pasukan",
    cn: "团队月度活动与培训总日程",
    ta: "குழு மாதாந்திர நிகழ்வுகள்"
  },
  image_url: {
    en: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=85",
    bm: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=85",
    cn: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=85",
    ta: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=85"
  },
  default_view: "dynamic",
  last_reviewed_month: "",
  recurring_rules: [],
  exceptions: [],
  blackout_dates: [],
  events: []
};
