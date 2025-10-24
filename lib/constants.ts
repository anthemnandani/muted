import { MessageReportCategory } from '@prisma/client';
import {
  FileText,
  Flag,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import {
  type NotificationTab,
  type ProfileFilter,
  ReportCategories,
} from './types';

export const UPLOAD_CONSTRAINTS = {
  MAX_ITEMS: 10,
  MAX_VIDEO_DURATION: 600,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
  },
  ACCEPTED_VIDEO_TYPES: {
    'video/*': ['.mp4', '.mov', '.avi'],
  },
};

export const PROFILE_FILTERS: Array<{
  label: string;
  value: ProfileFilter;
}> = [
  { label: 'Latest', value: 'LATEST' },
  { label: 'Oldest', value: 'OLDEST' },
];

export const REPORT_POST_CATEGORIES: ReportCategories = {
  VIOLENCE: {
    id: 'violence_abuse',
    label: 'Violence, abuse, and criminal exploitation',
    children: [
      {
        id: 'minor_exploitation',
        label: 'Exploitation and abuse of people under 18',
        points: [
          'Showing or promoting sexual exploitation of people under 18, including child sexual abuse material (CSAM), grooming, solicitation, and pedophilia',
          'Showing or promoting physical abuse, neglect, endangerment, and psychological abuse of people under 18',
          'Showing or promoting trafficking of people under 18 and recruitment of child soldiers',
          'Promoting or facilitating underage marriage',
        ],
      },
      {
        id: 'violent_threats',
        label: 'Physical violence and violent threats',
        points: [
          'Showing, promoting, or threatening physical violence, including real-world torture, graphic violence, and extreme physical fighting',
          'Promoting or materially supporting violent or hateful organizations, including violent extremists and criminal organizations',
        ],
      },
      {
        id: 'sexual_exploitation',
        label: 'Sexual exploitation and abuse',
        points: [
          'Showing or promoting non-consensual sexual acts that are real or fictional, including rape and molestation',
          'Showing or promoting non-consensual sharing of intimate content or threats to share such content',
          'Editing content to sexualize someone or create the appearance of them engaging in sexual activity',
          'Unwanted or degrading statements, such as statements about someone’s private body parts, sexual activity, or private sex life',
        ],
      },
      {
        id: 'human_exploitation',
        label: 'Human exploitation',
        points: ['Human trafficking', 'Human smuggling'],
      },
      {
        id: 'animal_abuse',
        label: 'Animal abuse',
        points: [
          'Showing or promoting physical abuse, mistreatment, and neglect of animals',
          'Showing or promoting sexual activity between an animal and a human (bestiality)',
          'Educational and documentary content that raises awareness about animal abuse is allowed as long as it does not include graphic content.',
        ],
      },
      {
        id: 'other_criminal_activities',
        label: 'Other criminal activities',
        points: [
          'Showing, promoting, or providing instructions on how to commit theft, destruction of property, and other criminal activities that may harm people, animals, or the natural environment',
        ],
      },
    ],
  },
  HATE_HARASSMENT: {
    id: 'hate_harassment',
    label: 'Hate and harassment',
    children: [
      {
        id: 'hateful_behavior',
        label: 'Hate speech and hateful behaviors',
        points: [
          'Showing or promoting violence, discrimination, and other harms, including claiming supremacy on the basis of personal characteristics, such as race, religion, gender, and sexual orientation',
          'Demeaning someone on the basis of these personal characteristics, including using hateful slurs',
          'Denying well-documented historical events that harmed protected groups, such as the Holocaust',
          'Promoting or supporting items, individuals, and organizations that promote hateful ideologies',
        ],
      },
      {
        id: 'harassment_bullying',
        label: 'Harassment and bullying',
        children: [
          {
            id: 'bullied_harassed',
            label: 'I have been bullied or harassed',
            points: [
              'Showing or promoting insulting someone or threatening to insult someone, including using profanity or obscene language to degrade them',
              'Showing, promoting, or threatening harassment or bullying, physical or otherwise, of others - including coordinated harassment',
              'Showing, promoting, or threatening behaviors such as doxing, blackmailing, revealing, or calling for the reveal of private or sensitive information',
            ],
          },
          {
            id: 'someone_bullied_harassed',
            label: 'Someone I know has been bullied or harassed',
            points: [],
            showUserSearch: true,
          },
          {
            id: 'celebrity_official_harassment',
            label:
              'A celebrity or government official has been bullied or harassed',
            points: [
              'Showing or promoting insulting someone or threatening to insult someone, including using profanity or obscene language to degrade them',
              'Showing, promoting, or threatening harassment or bullying, physical or otherwise, of others - including coordinated harassment',
              'Showing, promoting, or threatening behaviors such as doxing, blackmailing, revealing, or calling for the reveal of private or sensitive information',
            ],
            showAdditionalForm: true,
          },
          {
            id: 'other_harassment',
            label: 'Others have been bullied or harassed',
            points: [
              'Showing or promoting insulting someone or threatening to insult someone, including using profanity or obscene language to degrade them',
              'Showing, promoting, or threatening harassment or bullying, physical or otherwise, of others - including coordinated harassment',
              'Showing, promoting, or threatening behaviors such as doxing, blackmailing, revealing, or calling for the reveal of private or sensitive information',
            ],
          },
        ],
      },
    ],
  },
  SUICIDE_SELFHARM: {
    id: 'suicide_selfharm',
    label: 'Suicide and self-harm',
    points: [
      'Showing, promoting, or providing instructions on suicide, self-harm, and related games, dares, challenges, hoaxes, and pacts',
      'Sharing plans for suicide and self-harm',
    ],
  },
  DISORDERED_EATING: {
    id: 'disordered_eating',
    label: 'Disordered eating and unhealthy body image',
    points: [
      'Showing or promoting disordered eating, such as extreme dieting, fasting, bingeing, and intentional vomiting, as well as other dangerous weight loss behaviors, including compulsive exercise and use of potentially harmful medications and supplements',
      'Showing or promoting unhealthy body measurement trends',
    ],
  },
  DANGEROUS_ACTIVITIES: {
    id: 'dangerous_activities',
    label: 'Dangerous activities and challenges',
    points: [
      'Showing or promoting dangerous activities, games, dares, challenges, or stunts that cause or could cause significant physical harm or property damage, such as inappropriate use of dangerous tools, consumption of dangerous substances, and dangerous driving behavior',
      'Use of ceremonial tools, such as spears and shields, in religious festivals and cultural performances, is allowed.',
    ],
  },
  SEXUAL_CONTENT: {
    id: 'sexual_content',
    label: 'Nudity and sexual content',
    children: [
      {
        id: 'youth_sexual',
        label: 'Youth sexual activity, solicitation, and exploitation',
        points: [
          'Showing or promoting child sexual abuse material (CSAM) or youth sexual activity',
          'Showing or promoting youth nudity',
          'Promoting or normalizing youth sexual exploitation, sexual abuse, and sexual fetishism, including grooming, sextortion, and pedophilia',
          'Showing or promoting sexual solicitation, including inviting people under 18 to engage in a sexual act, go off-platform, and share sexually explicit images, even if the initiator is also under 18',
          'Objectifying or sexualizing people under 18 through images or in-app interaction features',
        ],
      },
      {
        id: 'youth_suggestive',
        label: 'Sexually suggestive behavior by youth',
        points: [
          'Significant youth body exposure',
          'Seductive performances by people under 18',
          'Direct or indirect references and hints to sex and sexual activities by young people',
          'Some non-sexualized content showing areolas or nipples in medical contexts, for educational purposes, or as part of a culturally accepted practice is allowed. Body exposure in culturally expected contexts, such as athletes wearing sports apparel and swimmers wearing swimsuits at a beach, is allowed.',
        ],
      },
      {
        id: 'adult_sexual',
        label: 'Adult sexual activity, services, and solicitation',
        points: [
          'Offering or asking for sexual partners or engaging in a sexual act',
          'Sexually explicit content, including pornographic content showing sexual intercourse, masturbation, and vivid descriptions of sexual acts',
        ],
      },
      {
        id: 'adult_nudity',
        label: 'Adult nudity',
        points: [
          'Adult nudity, including in photography and digitally created images (such as manga and anime)',
          'Some non-sexualized content showing areolas or nipples in medical contexts, for educational purposes, as part of a culturally accepted practice, or in culturally expected contexts, such as showing areolas or nipples during breastfeeding or at celebration festivals (like a carnival), is allowed.',
        ],
      },
      {
        id: 'explicit_language',
        label: 'Sexually explicit language',
        points: [
          'Sexually explicit narratives, such as vivid descriptions of sexual acts by adults or people under 18',
        ],
      },
    ],
  },
  SHOCKING_GRAPHIC_CONTENT: {
    id: 'shocking_graphic_content',
    label: 'Shocking and graphic content',
    points: [
      'Graphic deaths and accidents',
      'Human or animal body parts that are dismembered, mutilated, charred, burned, or severely injured',
      'Some content shown in an educational, artistic, or professional setting, such as professional fighting, is allowed.',
    ],
  },
  MISINFORMATION: {
    id: 'misinformation',
    label: 'Misinformation',
    children: [
      {
        id: 'election_misinformation',
        label: 'Election misinformation',
        points: [
          'Misinformation on how to vote or run for office',
          'Misinformation on final election results or outcomes',
        ],
      },
      {
        id: 'harmful_misinformation',
        label: 'Harmful misinformation',
        points: [
          'Misinformation that poses a risk to public safety or may cause panic, such as using old footage of a past event and falsely presenting it as current, or spreading inaccurate claims that essential items like food or water are no longer available',
          'Medical misinformation that poses a risk to public health, such as misleading statements about vaccines, and inaccurate medical advice that discourages people from getting appropriate medical care',
          'Climate change misinformation that contradicts well-established scientific consensus, such as denying the existence of climate change',
          'Dangerous conspiracy theories that promote violence, hatred, or target individuals, such as those causing prejudice toward a specific group and cause harm',
        ],
      },
      {
        id: 'deepfakes_synthetic_media',
        label: 'Deepfakes, synthetic media, and manipulated media',
        points: [
          'Synthetic or manipulated media showing realistic scenes that are not prominently disclosed or labeled in the video',
          'Synthetic media that contains the likeness (visual or audio) of a real person when used for political or commercial endorsements, or if violative of our community guidelines',
          'Material that has been edited in a way that may mislead a person about real-world events',
          'Synthetic media showing a public figure in artistic and educational contexts, such as a celebrity doing a popular dance, and a historical figure featured in a history lesson, is allowed.',
        ],
      },
    ],
  },
  DECEPTIVE_BEHAVIOR: {
    id: 'deceptive_behavior_and_spam',
    label: 'Deceptive behavior and spam',
    children: [
      {
        id: 'fake_engagement',
        label: 'Fake engagement',
        points: [
          'Providing instructions or promoting methods or services to help a user artificially increase engagement, such as selling followers or likes',
        ],
      },
      {
        id: 'spam',
        label: 'Spam',
        points: [
          'Accounts that are operated in bulk or through unauthorized automation such as bots to distribute high-volume content, including for commercial purposes',
          'Networks of accounts that represent similar entities or post similar content to lead users to specific locations on TikTok or off-platform, such as other accounts, websites, and businesses',
        ],
      },
    ],
  },
  REGULATED_GOODS_AND_ACTIVITIES: {
    id: 'regulated_goods_and_activities',
    label: 'Regulated goods and activities',
    children: [
      {
        id: 'gambling',
        label: 'Gambling',
        points: [
          'Gambling services, such as casinos, poker, slot games, roulette, lotteries, betting tips, and gambling-related software and apps',
          'Promoting or providing instructions on how to commit gambling fraud',
        ],
      },
      {
        id: 'alcohol_tobacco_drugs',
        label: 'Alcohol, tobacco, and drugs',
        points: [
          'Showing young people possessing, consuming, or trading alcohol, tobacco products, drugs, or other regulated substances',
          'Showing or promoting adults consuming drugs or other regulated substances for recreational purposes',
          'Showing or promoting the misuse of common household items or over-the-counter products to get intoxicated, such as antihistamines and sniffing glue',
          'Providing instructions on how to make homemade spirits, drugs, or other regulated substances',
          'Facilitating the trade or purchase of alcohol, tobacco products, drugs, or other regulated substances',
        ],
      },
      {
        id: 'firearms_dangerous_weapons',
        label: 'Firearms and dangerous weapons',
        points: [
          'Showing or promoting firearms or explosive weapons that are not used in a safe or appropriate setting',
          'Facilitating the trade of or offering instructions on how to make firearms or explosive weapons',
        ],
      },
      {
        id: 'trading_regulated_goods',
        label: 'Trade of other regulated goods and services',
        points: [
          'Trading fake currency and documents and stolen information',
          'Trading wildlife animals and any part of an endangered animal, such as products and medicine made from elephant ivory',
        ],
      },
    ],
  },
  FRAUDS_AND_SCAMS: {
    id: 'frauds_and_scams',
    label: 'Frauds and scams',
    points: [
      'Financial, investment, employment, or phishing scam, including identity theft',
      'Coordination or facilitation of scams, or instructions on how to carry out scams',
      'Organizational fraud, such as money laundering and moving illegally acquired money for someone else (money muling)',
      'Recruitment for multi-level marketing (MLM)',
    ],
  },
  SHARING_PERSONAL_INFORMATION: {
    id: 'sharing_personal_information',
    label: 'Sharing personal information',
    points: [
      'Sharing personal phone numbers and home addresses',
      'Sharing financial and payment information, such as bank accounts and credit card numbers',
      'Sharing login information, such as usernames and passwords',
      'Sharing identity documentation or numbers, such as passports and social security numbers',
    ],
  },
  COUNTERFEITS_AND_INTELLECTUAL_PROPERTY: {
    id: 'counterfeits_and_intellectual_property',
    label: 'Counterfeits and intellectual property',
    children: [
      {
        id: 'counterfeits_products',
        label: 'Counterfeit products',
        children: [
          {
            id: 'rights_holder',
            label: 'I am the rights holder',
            points: [
              'Copyright infringement of my original work (music, videos, artwork, or other content) being used without my permission or valid legal reason',
              'My copyrighted content is being used commercially or in a way that could cause confusion about its origin or ownership',
            ],
          },
          {
            id: 'suspected_infringement',
            label: 'Suspected infringement of others',
            points: [
              'Faciliating the trade of counterfeit products, such as luxury goods',
            ],
          },
        ],
      },
      // TODO: Make a separate page for this
      {
        id: 'intellectual_property_violation',
        label: 'Intellectual property violation',
        points: [
          'Copyright infringement, including unauthorized use of music, videos, artwork, or other original works without permission or valid legal reason',
          'Trademark infringement, including unauthorized use of brand names, logos, or symbols that could cause confusion about product/service origin or affiliation',
        ],
      },
    ],
  },
  UNDISCLOSED_BRANDED_CONTENT: {
    id: 'undisclosed_branded_content',
    label: 'Undisclosed branded content',
    points: [
      'Users are required to clearly disclose their Branded Content. Branded content on Muted is defined as content that promotes goods or services where the creator will receive (or have already received) something of value from a third party, such as a brand, in exchange for creator’s post, or which creator might otherwise need to disclose in accordance with the local laws or regulations. It could be a brand endorsement, partnership, or another kind of promotion for a product or service. Branded Content should follow our Branded Content Policy.',
    ],
  },
  OTHER: {
    id: 'other',
    label: 'Other',
    points: [
      'Our priority is to provide a safe and supportive environment. We also encourage authentic interactions by keeping deceptive content and accounts off our platform. Select this if your reason for reporting does not fall under any of the listed categories.',
    ],
  },
};

export const REPORT_USER_CATEGORIES: ReportCategories = {
  INAPPROPRIATE_CONTENT: {
    id: 'inappropriate_content',
    label: 'Posting Inappropriate Content',
    children: [
      {
        id: 'violence_abuse',
        label: 'Violence, abuse, and criminal exploitation',
        children: [
          {
            id: 'minor_exploitation',
            label: 'Exploitation and abuse of people under 18',
            points: [
              'Showing or promoting sexual exploitation of people under 18, including child sexual abuse material (CSAM), grooming, solicitation, and pedophilia',
              'Showing or promoting physical abuse, neglect, endangerment, and psychological abuse of people under 18',
              'Showing or promoting trafficking of people under 18 and recruitment of child soldiers',
              'Promoting or facilitating underage marriage',
            ],
          },
          {
            id: 'violent_threats',
            label: 'Physical violence and violent threats',
            points: [
              'Showing, promoting, or threatening physical violence, including real-world torture, graphic violence, and extreme physical fighting',
              'Promoting or materially supporting violent or hateful organizations, including violent extremists and criminal organizations',
            ],
          },
          {
            id: 'sexual_exploitation',
            label: 'Sexual exploitation and abuse',
            points: [
              'Showing or promoting non-consensual sexual acts that are real or fictional, including rape and molestation',
              'Showing or promoting non-consensual sharing of intimate content or threats to share such content',
              'Editing content to sexualize someone or create the appearance of them engaging in sexual activity',
              'Unwanted or degrading statements, such as statements about someone’s private body parts, sexual activity, or private sex life',
            ],
          },
          {
            id: 'human_exploitation',
            label: 'Human exploitation',
            points: ['Human trafficking', 'Human smuggling'],
          },
          {
            id: 'animal_abuse',
            label: 'Animal abuse',
            points: [
              'Showing or promoting physical abuse, mistreatment, and neglect of animals',
              'Showing or promoting sexual activity between an animal and a human (bestiality)',
              'Educational and documentary content that raises awareness about animal abuse is allowed as long as it does not include graphic content.',
            ],
          },
          {
            id: 'other_criminal_activities',
            label: 'Other criminal activities',
            points: [
              'Showing, promoting, or providing instructions on how to commit theft, destruction of property, and other criminal activities that may harm people, animals, or the natural environment',
            ],
          },
        ],
      },
      {
        id: 'hate_harassment',
        label: 'Hate and harassment',
        children: [
          {
            id: 'hateful_behavior',
            label: 'Hate speech and hateful behaviors',
            points: [
              'Showing or promoting violence, discrimination, and other harms, including claiming supremacy on the basis of personal characteristics, such as race, religion, gender, and sexual orientation',
              'Demeaning someone on the basis of these personal characteristics, including using hateful slurs',
              'Denying well-documented historical events that harmed protected groups, such as the Holocaust',
              'Promoting or supporting items, individuals, and organizations that promote hateful ideologies',
            ],
          },
          {
            id: 'harassment_bullying',
            label: 'Harassment and bullying',
            points: [
              'Showing or promoting insulting someone or threatening to insult someone, including using profanity or obscene language to degrade them',
              'Showing, promoting, or threatening harassment or bullying, physical or otherwise, of others - including coordinated harassment',
              'Showing, promoting, or threatening behaviors such as doxing, blackmailing, revealing, or calling for the reveal of private or sensitive information',
            ],
          },
        ],
      },
      {
        id: 'suicide_selfharm',
        label: 'Suicide and self-harm',
        points: [
          'Showing, promoting, or providing instructions on suicide, self-harm, and related games, dares, challenges, hoaxes, and pacts',
          'Sharing plans for suicide and self-harm',
        ],
      },
      {
        id: 'disordered_eating',
        label: 'Disordered eating and unhealthy body image',
        points: [
          'Showing or promoting disordered eating, such as extreme dieting, fasting, bingeing, and intentional vomiting, as well as other dangerous weight loss behaviors, including compulsive exercise and use of potentially harmful medications and supplements',
          'Showing or promoting unhealthy body measurement trends',
        ],
      },
      {
        id: 'dangerous_activities',
        label: 'Dangerous activities and challenges',
        points: [
          'Showing or promoting dangerous activities, games, dares, challenges, or stunts that cause or could cause significant physical harm or property damage, such as inappropriate use of dangerous tools, consumption of dangerous substances, and dangerous driving behavior',
          'Use of ceremonial tools, such as spears and shields, in religious festivals and cultural performances, is allowed.',
        ],
      },
      {
        id: 'sexual_content',
        label: 'Nudity and sexual content',
        children: [
          {
            id: 'youth_sexual',
            label: 'Youth sexual activity, solicitation, and exploitation',
            points: [
              'Showing or promoting child sexual abuse material (CSAM) or youth sexual activity',
              'Showing or promoting youth nudity',
              'Promoting or normalizing youth sexual exploitation, sexual abuse, and sexual fetishism, including grooming, sextortion, and pedophilia',
              'Showing or promoting sexual solicitation, including inviting people under 18 to engage in a sexual act, go off-platform, and share sexually explicit images, even if the initiator is also under 18',
              'Objectifying or sexualizing people under 18 through images or in-app interaction features',
            ],
          },
          {
            id: 'youth_suggestive',
            label: 'Sexually suggestive behavior by youth',
            points: [
              'Significant youth body exposure',
              'Seductive performances by people under 18',
              'Direct or indirect references and hints to sex and sexual activities by young people',
              'Some non-sexualized content showing areolas or nipples in medical contexts, for educational purposes, or as part of a culturally accepted practice is allowed. Body exposure in culturally expected contexts, such as athletes wearing sports apparel and swimmers wearing swimsuits at a beach, is allowed.',
            ],
          },
          {
            id: 'adult_sexual',
            label: 'Adult sexual activity, services, and solicitation',
            points: [
              'Offering or asking for sexual partners or engaging in a sexual act',
              'Sexually explicit content, including pornographic content showing sexual intercourse, masturbation, and vivid descriptions of sexual acts',
            ],
          },
          {
            id: 'adult_nudity',
            label: 'Adult nudity',
            points: [
              'Adult nudity, including in photography and digitally created images (such as manga and anime)',
              'Some non-sexualized content showing areolas or nipples in medical contexts, for educational purposes, as part of a culturally accepted practice, or in culturally expected contexts, such as showing areolas or nipples during breastfeeding or at celebration festivals (like a carnival), is allowed.',
            ],
          },
          {
            id: 'explicit_language',
            label: 'Sexually explicit language',
            points: [
              'Sexually explicit narratives, such as vivid descriptions of sexual acts by adults or people under 18',
            ],
          },
        ],
      },
      {
        id: 'shocking_graphic_content',
        label: 'Shocking and graphic content',
        points: [
          'Graphic deaths and accidents',
          'Human or animal body parts that are dismembered, mutilated, charred, burned, or severely injured',
          'Some content shown in an educational, artistic, or professional setting, such as professional fighting, is allowed.',
        ],
      },
      {
        id: 'misinformation',
        label: 'Misinformation',
        children: [
          {
            id: 'election_misinformation',
            label: 'Election misinformation',
            points: [
              'Misinformation on how to vote or run for office',
              'Misinformation on final election results or outcomes',
            ],
          },
          {
            id: 'harmful_misinformation',
            label: 'Harmful misinformation',
            points: [
              'Misinformation that poses a risk to public safety or may cause panic, such as using old footage of a past event and falsely presenting it as current, or spreading inaccurate claims that essential items like food or water are no longer available',
              'Medical misinformation that poses a risk to public health, such as misleading statements about vaccines, and inaccurate medical advice that discourages people from getting appropriate medical care',
              'Climate change misinformation that contradicts well-established scientific consensus, such as denying the existence of climate change',
              'Dangerous conspiracy theories that promote violence, hatred, or target individuals, such as those causing prejudice toward a specific group and cause harm',
            ],
          },
          {
            id: 'deepfakes_synthetic_media',
            label: 'Deepfakes, synthetic media, and manipulated media',
            points: [
              'Synthetic or manipulated media showing realistic scenes that are not prominently disclosed or labeled in the video',
              'Synthetic media that contains the likeness (visual or audio) of a real person when used for political or commercial endorsements, or if violative of our community guidelines',
              'Material that has been edited in a way that may mislead a person about real-world events',
              'Synthetic media showing a public figure in artistic and educational contexts, such as a celebrity doing a popular dance, and a historical figure featured in a history lesson, is allowed.',
            ],
          },
        ],
      },
      {
        id: 'deceptive_behavior_and_spam',
        label: 'Deceptive behavior and spam',
        children: [
          {
            id: 'fake_engagement',
            label: 'Fake engagement',
            points: [
              'Providing instructions or promoting methods or services to help a user artificially increase engagement, such as selling followers or likes',
            ],
          },
          {
            id: 'spam',
            label: 'Spam',
            points: [
              'Accounts that are operated in bulk or through unauthorized automation such as bots to distribute high-volume content, including for commercial purposes',
              'Networks of accounts that represent similar entities or post similar content to lead users to specific locations on TikTok or off-platform, such as other accounts, websites, and businesses',
            ],
          },
        ],
      },
      {
        id: 'regulated_goods_and_activities',
        label: 'Regulated goods and activities',
        children: [
          {
            id: 'gambling',
            label: 'Gambling',
            points: [
              'Gambling services, such as casinos, poker, slot games, roulette, lotteries, betting tips, and gambling-related software and apps',
              'Promoting or providing instructions on how to commit gambling fraud',
            ],
          },
          {
            id: 'alcohol_tobacco_drugs',
            label: 'Alcohol, tobacco, and drugs',
            points: [
              'Showing young people possessing, consuming, or trading alcohol, tobacco products, drugs, or other regulated substances',
              'Showing or promoting adults consuming drugs or other regulated substances for recreational purposes',
              'Showing or promoting the misuse of common household items or over-the-counter products to get intoxicated, such as antihistamines and sniffing glue',
              'Providing instructions on how to make homemade spirits, drugs, or other regulated substances',
              'Facilitating the trade or purchase of alcohol, tobacco products, drugs, or other regulated substances',
            ],
          },
          {
            id: 'firearms_dangerous_weapons',
            label: 'Firearms and dangerous weapons',
            points: [
              'Showing or promoting firearms or explosive weapons that are not used in a safe or appropriate setting',
              'Facilitating the trade of or offering instructions on how to make firearms or explosive weapons',
            ],
          },
          {
            id: 'trading_regulated_goods',
            label: 'Trade of other regulated goods and services',
            points: [
              'Trading fake currency and documents and stolen information',
              'Trading wildlife animals and any part of an endangered animal, such as products and medicine made from elephant ivory',
            ],
          },
        ],
      },
      {
        id: 'sharing_personal_information',
        label: 'Sharing personal information',
        points: [
          'Sharing personal phone numbers and home addresses',
          'Sharing financial and payment information, such as bank accounts and credit card numbers',
          'Sharing login information, such as usernames and passwords',
          'Sharing identity documentation or numbers, such as passports and social security numbers',
        ],
      },
    ],
  },
  PRETENDING_TO_BE_SOMEONE: {
    id: 'pretending_to_be_someone',
    label: 'Pretending to Be Someone',
    children: [
      {
        id: 'pretending_to_be_me',
        label: 'Me',
        points: [
          'Actions that impersonate other individuals or organizations in order to deceive the public',
        ],
      },
      {
        id: 'pretending_to_be_celebrity',
        label: 'Celebrity',
        points: [],
        showUserSearch: true,
      },
    ],
  },
  INAPPROPRIATE_PROFILE_INFO: {
    id: 'inappropriate_profile_info',
    label: 'Inappropriate Profile Info',
    children: [
      {
        id: 'profile_photo',
        label: 'Profile Photo',
        points: ['Imagery or text that violates our Community Guidelines'],
      },
      {
        id: 'nickname',
        label: 'Nickname',
        points: ['Imagery or text that violates our Community Guidelines'],
      },
      {
        id: 'username',
        label: 'Username',
        points: ['Imagery or text that violates our Community Guidelines'],
      },
      {
        id: 'bio',
        label: 'Bio',
        points: ['Imagery or text that violates our Community Guidelines'],
      },
      {
        id: 'link',
        label: 'Link',
        points: ['Imagery or text that violates our Community Guidelines'],
      },
    ],
  },
  UNDER_13_YEARS: {
    id: 'under_13_years',
    label: 'User could be under 13 years old',
    points: ['Users who are too young to be on Muted'],
  },
  FRAUDS_AND_SCAMS: {
    id: 'frauds_and_scams',
    label: 'Frauds and scams',
    points: [
      'Financial, investment, employment, or phishing scam, including identity theft',
      'Coordination or facilitation of scams, or instructions on how to carry out scams',
      'Organizational fraud, such as money laundering and moving illegally acquired money for someone else (money muling)',
      'Recruitment for multi-level marketing (MLM)',
    ],
  },
  COUNTERFEITS_AND_INTELLECTUAL_PROPERTY: {
    id: 'counterfeits_and_intellectual_property',
    label: 'Counterfeits and intellectual property',
    children: [
      {
        id: 'counterfeits_products',
        label: 'Counterfeit products',
        children: [
          // TODO: Make a separate page for this
          {
            id: 'rights_holder',
            label: 'I am the rights holder',
            points: [
              'Copyright infringement of my original work (music, videos, artwork, or other content) being used without my permission or valid legal reason',
              'My copyrighted content is being used commercially or in a way that could cause confusion about its origin or ownership',
            ],
          },
          {
            id: 'suspected_infringement',
            label: 'Suspected infringement of others',
            points: [
              'Faciliating the trade of counterfeit products, such as luxury goods',
            ],
          },
        ],
      },
      // TODO: Make a separate page for this
      {
        id: 'intellectual_property_violation',
        label: 'Intellectual property violation',
        points: [
          'Copyright infringement, including unauthorized use of music, videos, artwork, or other original works without permission or valid legal reason',
          'Trademark infringement, including unauthorized use of brand names, logos, or symbols that could cause confusion about product/service origin or affiliation',
        ],
      },
    ],
  },
  OTHER: {
    id: 'other',
    label: 'Other',
    points: [
      'Our priority is to provide a safe and supportive environment. We also encourage authentic interactions by keeping deceptive content and accounts off our platform. Select this if your reason for reporting does not fall under any of the listed categories.',
    ],
  },
};

export const NOTIFICATION_FILTERS: Array<{
  id: NotificationTab;
  label: string;
}> = [
  {
    id: 'all',
    label: 'All activity',
  },
  {
    id: 'likes',
    label: 'Likes',
  },
  {
    id: 'comments',
    label: 'Comments',
  },
  {
    id: 'mentions',
    label: 'Mentions',
  },
  {
    id: 'followers',
    label: 'Followers',
  },
];

export const EMOJIS = [
  '❤️',
  '😂',
  '😡',
  '😭',
  '👍',
  '🤔',
  '🎉',
  '🤗',
  '😳',
  '😱',
  '🤪',
  '🙈',
];

export const MESSAGE_REPORT_CATEGORIES = [
  {
    id: MessageReportCategory.NUDITY_SEXUAL,
    label: 'Nudity and sexual content',
  },
  {
    id: MessageReportCategory.SEXTORTION_INTIMATE_ABUSE,
    label: 'Sextortion and intimate image abuse',
  },
  {
    id: MessageReportCategory.REGULATED_GOODS,
    label: 'Regulated goods and activities',
  },
  {
    id: MessageReportCategory.HATE_HARASSMENT,
    label: 'Hate and harassment',
  },
  {
    id: MessageReportCategory.FRAUDS_SCAMS,
    label: 'Frauds and scams',
  },
  {
    id: MessageReportCategory.MINOR_SAFETY,
    label: 'Minor safety',
  },
  {
    id: MessageReportCategory.MISINFORMATION,
    label: 'Misinformation',
  },
  {
    id: MessageReportCategory.VIOLENCE_CRIMINAL,
    label: 'Violence, abuse, and criminal exploitation',
  },
  {
    id: MessageReportCategory.SHOCKING_GRAPHIC,
    label: 'Shocking and graphic content',
  },
  {
    id: MessageReportCategory.SUICIDE_SELF_HARM,
    label: 'Suicide and self-harm',
  },
  {
    id: MessageReportCategory.EATING_DISORDER,
    label: 'Disordered eating and unhealthy body image',
  },
  {
    id: MessageReportCategory.DANGEROUS_ACTIVITIES,
    label: 'Dangerous activities and challenges',
  },
  {
    id: MessageReportCategory.DECEPTIVE_SPAM,
    label: 'Deceptive behavior and spam',
  },
  {
    id: MessageReportCategory.PERSONAL_INFO,
    label: 'Sharing personal information',
  },
  {
    id: MessageReportCategory.DANGEROUS_GOODS,
    label: 'Dangerous goods or services',
  },
  {
    id: MessageReportCategory.INTELLECTUAL_PROPERTY,
    label: 'Intellectual property infringement',
  },
  {
    id: MessageReportCategory.ADVERTISEMENT_MISMATCH,
    label: 'Advertisement does not match the item',
  },
  {
    id: MessageReportCategory.OTHER,
    label: 'Other',
  },
] as const;

export const DELETE_USER_POINTS = [
  {
    id: 1,
    text: 'You won’t be able to log in and use any Muted services with that account.',
  },
  {
    id: 2,
    text: 'You will lose access to all your videos.',
  },
  {
    id: 3,
    text: "Information that isn't stored in your account, such as direct messages, may still be visible to others.",
  },
];

export const ADMIN_MENU_ITEMS = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Content Moderation',
    url: '/admin/content',
    icon: FileText,
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Reports',
    url: '/admin/reports',
    icon: Flag,
  },
  { title: 'Appeals', url: '/admin/appeals', icon: Shield },
];

export const ADMIN_ACCOUNT_ITEMS = [
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
  // {
  //   title: 'Logout',
  //   url: '/logout',
  //   icon: LogOut,
  // },
];

export const STRIKE_REASON_OPTIONS = [
  { value: 'harassment_bullying', label: 'Harassment and Bullying' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'spam_scams', label: 'Spam and Scams' },
  { value: 'nudity_sexual_content', label: 'Nudity or Sexual Content' },
  { value: 'violent_graphic_content', label: 'Violent or Graphic Content' },
  { value: 'dangerous_acts', label: 'Dangerous Acts or Challenges' },
  { value: 'illegal_goods_sale', label: 'Sale of illegal or regulated goods' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'minor_safety', label: 'Minor Safety Violation' },
  { value: 'other', label: 'Other Policy Violation' },
] as const;
