import { ChangelogData, ChangelogTranslations, SupportedLocale } from '@/types/changelog';

export const changelogData: ChangelogData = {
  entries: [
    {
      version: "v0.0.8",
      date: "2025-09-07",
      title: {
        zh: "国际化扩展与维护",
        en: "Internationalization Expansion & Maintenance",
        hi: "अंतर्राष्ट्रीयकरण विस्तार और रखरखाव"
      },
      description: {
        zh: "新增印度语支持，修复开发环境问题，优化代码结构",
        en: "Added Hindi language support, fixed development environment issues, optimized code structure",
        hi: "हिंदी भाषा समर्थन जोड़ा, डेवलपमेंट एनवायरनमेंट समस्याएं ठीक कीं, कोड संरचना को ऑप्टिमाइज़ किया"
      },
      type: "minor",
      changes: [
        {
          type: "feature",
          title: {
            zh: "新增印度语支持",
            en: "Added Hindi Language Support",
            hi: "हिंदी भाषा समर्थन जोड़ा"
          },
          description: {
            zh: "扩展多语言支持范围，新增 Hindi 语言界面，服务更多用户群体",
            en: "Expanded multilingual support coverage, added Hindi language interface to serve more user groups",
            hi: "बहुभाषी समर्थन कवरेज का विस्तार, अधिक उपयोगकर्ता समूहों की सेवा के लिए हिंदी भाषा इंटरफेस जोड़ा"
          },
          icon: "Globe",
          commits: ["c5337bd"]
        },
        {
          type: "fix",
          title: {
            zh: "依赖管理修复",
            en: "Dependency Management Fix",
            hi: "डिपेंडेंसी प्रबंधन सुधार"
          },
          description: {
            zh: "解决包管理器锁定文件不匹配问题，确保开发环境一致性",
            en: "Resolved package manager lock file mismatch issues to ensure development environment consistency",
            hi: "डेवलपमेंट एनवायरनमेंट निरंतरता सुनिश्चित करने के लिए पैकेज मैनेजर लॉक फ़ाइल मिसमैच समस्याओं को हल किया"
          },
          icon: "Lock",
          commits: ["e6c0ff2"]
        },
        {
          type: "improvement",
          title: {
            zh: "代码清理优化",
            en: "Code Cleanup Optimization",
            hi: "कोड सफाई ऑप्टिमाइज़ेशन"
          },
          description: {
            zh: "清理无效代码和文件，优化项目结构，提升维护性",
            en: "Cleaned up invalid code and files, optimized project structure, improved maintainability",
            hi: "अमान्य कोड और फ़ाइलों को साफ किया, परियोजना संरचना को ऑप्टिमाइज़ किया, रखरखाव में सुधार किया"
          },
          icon: "Trash2",
          commits: ["2022fe1"]
        }
      ]
    },
    {
      version: "v0.0.7",
      date: "2025-09-06",
      title: {
        zh: "界面优化与代码重构",
        en: "Interface Optimization & Code Refactoring",
        hi: "इंटरफेस ऑप्टिमाइज़ेशन और कोड रीफैक्टरिंग"
      },
      description: {
        zh: "改进用户界面体验，重构核心代码，提升系统稳定性",
        en: "Improved user interface experience, refactored core code, enhanced system stability",
        hi: "उपयोगकर्ता इंटरफेस अनुभव में सुधार, कोर कोड को रीफैक्टर किया, सिस्टम स्थिरता बढ़ाई"
      },
      type: "minor",
      changes: [
        {
          type: "improvement",
          title: {
            zh: "界面体验优化",
            en: "Interface Experience Optimization",
            hi: "इंटरफेस अनुभव ऑप्टिमाइज़ेशन"
          },
          description: {
            zh: "优化压缩模式切换，改进默认设置，提升用户操作体验",
            en: "Optimized compression mode switching, improved default settings, enhanced user operation experience",
            hi: "कम्प्रेशन मोड स्विचिंग को ऑप्टिमाइज़ किया, डिफ़ॉल्ट सेटिंग्स में सुधार, उपयोगकर्ता ऑपरेशन अनुभव बेहतर बनाया"
          },
          icon: "Palette",
          commits: ["94d5ca7", "ae3cffc", "4303de5"]
        },
        {
          type: "improvement",
          title: {
            zh: "首页代码重构",
            en: "Homepage Code Refactoring",
            hi: "होमपेज कोड रीफैक्टरिंग"
          },
          description: {
            zh: "重构首页核心逻辑，提高代码可维护性和扩展性",
            en: "Refactored homepage core logic to improve code maintainability and extensibility",
            hi: "कोड रखरखाव और विस्तार में सुधार के लिए होमपेज कोर लॉजिक को रीफैक्टर किया"
          },
          icon: "RefreshCw",
          commits: ["4dfc85b"]
        }
      ]
    },
    {
      version: "v0.0.6",
      date: "2025-09-04",
      title: {
        zh: "页面完善与SEO修复",
        en: "Page Enhancement & SEO Fixes",
        hi: "पेज वृद्धि और SEO सुधार"
      },
      description: {
        zh: "完善主页内容展示，修复SEO重复页面问题",
        en: "Enhanced homepage content display, fixed SEO duplicate page issues",
        hi: "होमपेज कंटेंट डिस्प्ले को बेहतर बनाया, SEO डुप्लिकेट पेज समस्याओं को ठीक किया"
      },
      type: "minor",
      changes: [
        {
          type: "improvement",
          title: {
            zh: "首页功能完善",
            en: "Homepage Feature Enhancement",
            hi: "होमपेज फीचर वृद्धि"
          },
          description: {
            zh: "补充首页缺失内容，完善功能介绍和使用指南",
            en: "Added missing homepage content, improved feature introductions and usage guides",
            hi: "लापता होमपेज कंटेंट जोड़ा, फीचर परिचय और उपयोग गाइड में सुधार"
          },
          icon: "Home",
          commits: ["669217c"]
        }
      ]
    },
    {
      version: "v0.0.5",
      date: "2025-09-03",
      title: {
        zh: "多语言系统完善",
        en: "Multilingual System Enhancement",
        hi: "बहुभाषी सिस्टम वृद्धि"
      },
      description: {
        zh: "全面完善多语言支持，优化国际化用户体验",
        en: "Comprehensively improved multilingual support, optimized internationalization user experience",
        hi: "बहुभाषी समर्थन में व्यापक सुधार, अंतर्राष्ट्रीयकरण उपयोगकर्ता अनुभव को ऑप्टिमाइज़ किया"
      },
      type: "minor",
      changes: [
        {
          type: "feature",
          title: {
            zh: "多语言功能增强",
            en: "Multilingual Feature Enhancement",
            hi: "बहुभाषी फीचर वृद्धि"
          },
          description: {
            zh: "完善中英文切换功能，优化语言检测和默认设置，改进多语言布局",
            en: "Enhanced Chinese-English switching functionality, optimized language detection and default settings, improved multilingual layout",
            hi: "चीनी-अंग्रेजी स्विचिंग कार्यक्षमता में वृद्धि, भाषा पहचान और डिफ़ॉल्ट सेटिंग्स को ऑप्टिमाइज़ किया, बहुभाषी लेआउट में सुधार"
          },
          icon: "Languages",
          commits: ["2e29d3f", "055710f", "942d697", "66523ea"]
        },
        {
          type: "fix",
          title: {
            zh: "代码质量修复",
            en: "Code Quality Fixes",
            hi: "कोड गुणवत्ता सुधार"
          },
          description: {
            zh: "修复 ESLint 警告和错误，提升代码规范性和一致性",
            en: "Fixed ESLint warnings and errors, improved code standardization and consistency",
            hi: "ESLint चेतावनियां और त्रुटियां ठीक कीं, कोड मानकीकरण और निरंतरता में सुधार"
          },
          icon: "Code",
          commits: ["aa730b0"]
        }
      ]
    },
    {
      version: "v0.0.4",
      date: "2025-09-02",
      title: {
        zh: "图片尺寸调整功能",
        en: "Image Resize Functionality",
        hi: "इमेज रीसाइज़ फ़ंक्शनैलिटी"
      },
      description: {
        zh: "新增专业的图片尺寸调整和裁剪功能，支持多种预设比例",
        en: "Added professional image resizing and cropping features with multiple preset ratios",
        hi: "कई प्रीसेट अनुपातों के साथ पेशेवर इमेज रीसाइजिंग और क्रॉपिंग सुविधाएं जोड़ीं"
      },
      type: "minor",
      changes: [
        {
          type: "feature",
          title: {
            zh: "图片尺寸调整",
            en: "Image Resize Feature",
            hi: "इमेज रीसाइज़ फीचर"
          },
          description: {
            zh: "新增图片尺寸调整功能，支持自定义尺寸、预设比例和智能裁剪",
            en: "Added image resizing functionality supporting custom dimensions, preset ratios and smart cropping",
            hi: "कस्टम आयाम, प्रीसेट अनुपात और स्मार्ट क्रॉपिंग को सपोर्ट करने वाली इमेज रीसाइजिंग कार्यक्षमता जोड़ी"
          },
          icon: "Crop",
          commits: ["6fa7638", "9365164"]
        }
      ]
    },
    {
      version: "v0.0.3",
      date: "2025-09-01",
      title: {
        zh: "SEO与多语言基础建设",
        en: "SEO & Multilingual Foundation",
        hi: "SEO और बहुभाषी फाउंडेशन"
      },
      description: {
        zh: "建立SEO优化基础，实现多语言支持，增强用户体验功能",
        en: "Established SEO optimization foundation, implemented multilingual support, enhanced user experience features",
        hi: "SEO ऑप्टिमाइज़ेशन फाउंडेशन स्थापित किया, बहुभाषी समर्थन लागू किया, उपयोगकर्ता अनुभव सुविधाओं को बेहतर बनाया"
      },
      type: "minor",
      changes: [
        {
          type: "feature",
          title: {
            zh: "多语言基础支持",
            en: "Basic Multilingual Support",
            hi: "बुनियादी बहुभाषी समर्थन"
          },
          description: {
            zh: "实现中英文双语界面，建立国际化框架基础",
            en: "Implemented Chinese-English bilingual interface, established internationalization framework foundation",
            hi: "चीनी-अंग्रेजी द्विभाषी इंटरफेस लागू किया, अंतर्राष्ट्रीयकरण फ्रेमवर्क फाउंडेशन स्थापित किया"
          },
          icon: "Globe",
          commits: ["93191a3"]
        },
        {
          type: "feature",
          title: {
            zh: "文件夹批量上传",
            en: "Folder Batch Upload",
            hi: "फ़ोल्डर बैच अपलोड"
          },
          description: {
            zh: "支持选择整个文件夹批量上传图片，大幅提升批处理效率",
            en: "Support selecting entire folder for batch image upload, significantly improving batch processing efficiency",
            hi: "बैच प्रोसेसिंग दक्षता में काफी सुधार के लिए संपूर्ण फ़ोल्डर के बैच इमेज अपलोड का समर्थन"
          },
          icon: "FolderOpen",
          commits: ["88d478c"]
        },
        {
          type: "feature",
          title: {
            zh: "本地历史记录",
            en: "Local History Records",
            hi: "स्थानीय हिस्ट्री रिकॉर्ड"
          },
          description: {
            zh: "新增压缩历史本地保存功能，方便用户管理和重新下载已处理图片",
            en: "Added compression history local storage feature for convenient user management and re-downloading of processed images",
            hi: "उपयोगकर्ता प्रबंधन और प्रोसेस की गई इमेज के पुन: डाउनलोड की सुविधा के लिए कम्प्रेशन हिस्ट्री लोकल स्टोरेज फीचर जोड़ा"
          },
          icon: "History",
          commits: ["9a79eee"]
        },
        {
          type: "improvement",
          title: {
            zh: "下载功能优化",
            en: "Download Feature Optimization",
            hi: "डाउनलोड फीचर ऑप्टिमाइज़ेशन"
          },
          description: {
            zh: "优化下载按钮行为，改进质量压缩描述，提升用户体验",
            en: "Optimized download button behavior, improved quality compression description, enhanced user experience",
            hi: "डाउनलोड बटन व्यवहार को ऑप्टिमाइज़ किया, गुणवत्ता कम्प्रेशन विवरण में सुधार, उपयोगकर्ता अनुभव बेहतर बनाया"
          },
          icon: "Download",
          commits: ["47b03b6", "b353fb9"]
        }
      ]
    },
    {
      version: "v0.0.2",
      date: "2025-08-31",
      title: {
        zh: "云存储与批处理核心",
        en: "Cloud Storage & Batch Processing Core",
        hi: "क्लाउड स्टोरेज और बैच प्रोसेसिंग कोर"
      },
      description: {
        zh: "集成Cloudflare R2云存储，实现批量压缩处理核心功能",
        en: "Integrated Cloudflare R2 cloud storage, implemented core batch compression processing functionality",
        hi: "Cloudflare R2 क्लाउड स्टोरेज को एकीकृत किया, कोर बैच कम्प्रेशन प्रोसेसिंग कार्यक्षमता लागू की"
      },
      type: "minor",
      changes: [
        {
          type: "feature",
          title: {
            zh: "Cloudflare R2 存储集成",
            en: "Cloudflare R2 Storage Integration",
            hi: "Cloudflare R2 स्टोरेज इंटीग्रेशन"
          },
          description: {
            zh: "集成 Cloudflare R2 对象存储服务，实现图片云端处理和存储",
            en: "Integrated Cloudflare R2 object storage service for cloud-based image processing and storage",
            hi: "क्लाउड-आधारित इमेज प्रोसेसिंग और स्टोरेज के लिए Cloudflare R2 ऑब्जेक्ट स्टोरेज सेवा को एकीकृत किया"
          },
          icon: "Cloud",
          commits: ["9e85206"]
        },
        {
          type: "feature",
          title: {
            zh: "批量压缩功能",
            en: "Batch Compression Feature",
            hi: "बैच कम्प्रेशन फीचर"
          },
          description: {
            zh: "支持同时处理多张图片，大幅提升工作效率",
            en: "Support processing multiple images simultaneously, significantly improving work efficiency",
            hi: "कार्य दक्षता में काफी सुधार के लिए एक साथ कई इमेज प्रोसेस करने का समर्थन"
          },
          icon: "Package",
          commits: ["65f8295"]
        },
        {
          type: "fix",
          title: {
            zh: "显示问题修复",
            en: "Display Issues Fix",
            hi: "डिस्प्ले समस्याओं का सुधार"
          },
          description: {
            zh: "修复图片压缩显示问题，解决定时任务和依赖管理相关问题",
            en: "Fixed image compression display issues, resolved timing tasks and dependency management related problems",
            hi: "इमेज कम्प्रेशन डिस्प्ले समस्याओं को ठीक किया, टाइमिंग कार्य और डिपेंडेंसी प्रबंधन संबंधित समस्याओं को हल किया"
          },
          icon: "Eye",
          commits: ["5fbc1f2", "406e361", "8ca6d24"]
        }
      ]
    },
    {
      version: "v0.0.1",
      date: "2025-08-31",
      title: {
        zh: "项目初始发布",
        en: "Initial Project Release",
        hi: "प्रारंभिक परियोजना रिलीज"
      },
      description: {
        zh: "基于Next.js构建的现代化图片压缩工具初始版本发布",
        en: "Initial release of modern image compression tool built with Next.js",
        hi: "Next.js के साथ निर्मित आधुनिक इमेज कम्प्रेशन टूल का प्रारंभिक संस्करण रिलीज"
      },
      type: "major",
      changes: [
        {
          type: "feature",
          title: {
            zh: "首个正式版本",
            en: "First Official Release",
            hi: "पहला आधिकारिक रिलीज"
          },
          description: {
            zh: "项目初始化，实现基础的单张图片压缩功能，建立核心架构",
            en: "Project initialization, implemented basic single image compression functionality, established core architecture",
            hi: "परियोजना प्रारंभीकरण, बुनियादी एकल इमेज कम्प्रेशन कार्यक्षमता लागू की, कोर आर्किटेक्चर स्थापित किया"
          },
          icon: "Zap",
          commits: ["1a22a1d", "9d17a6f"]
        }
      ]
    }
  ]
};

export const changelogTranslations: Record<SupportedLocale, ChangelogTranslations> = {
  zh: {
    title: "更新日志",
    subtitle: "项目开发历程与功能演进",
    backToApp: "返回应用",
    types: {
      major: "重大版本",
      minor: "功能版本",
      patch: "修复版本",
      fix: "问题修复"
    },
    changeTypes: {
      feature: "新功能",
      fix: "问题修复",
      improvement: "功能改进",
      breaking: "破坏性变更"
    }
  },
  en: {
    title: "Changelog",
    subtitle: "Project development history and feature evolution",
    backToApp: "Back to App",
    types: {
      major: "Major Version",
      minor: "Feature Version",
      patch: "Fix Version",
      fix: "Bug Fix"
    },
    changeTypes: {
      feature: "New Feature",
      fix: "Bug Fix",
      improvement: "Feature Improvement",
      breaking: "Breaking Change"
    }
  },
  hi: {
    title: "चेंजलॉग",
    subtitle: "परियोजना विकास इतिहास और सुविधा विकास",
    backToApp: "ऐप पर वापस जाएं",
    types: {
      major: "मेजर वर्जन",
      minor: "फीचर वर्जन",
      patch: "फिक्स वर्जन",
      fix: "बग फिक्स"
    },
    changeTypes: {
      feature: "नई सुविधा",
      fix: "बग फिक्स",
      improvement: "सुविधा सुधार",
      breaking: "ब्रेकिंग चेंज"
    }
  }
};