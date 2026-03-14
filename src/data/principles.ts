export interface PrincipleSection {
  heading?: string
  body: string
  listItems?: string[]
  imageUrl?: string
}

export interface Principle {
  id: string
  number: number
  title: string
  titleEn?: string
  sections: PrincipleSection[]
}

export const principles: Principle[] = [
  {
    id: '12-zones',
    number: 1,
    title: '12 אזורים',
    titleEn: '12 Zones',
    sections: [
      {
        body: 'Master Tung divided his points between anatomical zones, a tradition originating from Huang Fu Mi\'s A-B Classic of Acupuncture and Moxibustion (Zhenjiu jiayi jing) [針灸甲乙經]. This zonal point presentation has been passed down through dynasties. Master Tung\'s acupuncture employs a twelve-zone division, numbered as follows:',
        listItems: [
          '11 — Fingers (bones of the hand)',
          '22 — Hands (metacarpals and carpals)',
          '33 — Forearms (ulna and radius)',
          '44 — Upper arm',
          '55 — Soles (Plantar aspect of the foot)',
          '66 — Feet (Dorsal aspect of foot)',
          '77 — Lower leg (tibia and fibula)',
          '88 — Thighs (femur)',
          '99 — Ears',
          '1010 — Head',
          'VT — Ventral trunk',
          'DT — Dorsal trunk',
        ],
      },
      {
        heading: 'Micro-System',
        body: 'Each of the 12 zones of Master Tung\'s Acupuncture serves as a micro-system for treating the whole body while possessing unique characteristics. The differences between zones can be described using Yin-Yang theory (McCann and Ross, 2018). For example, the four limb zones can be categorized as Yin or Yang based on two variables:',
        listItems: [
          'The upper limbs are Yang compared to Yin\'s lower limbs.',
          'Extremities (hands and feet) are Yang compared to proximal zones, which are Yin.',
        ],
      },
      {
        body: 'Yang zones address acute conditions characterized by excess, while Yin zones treat chronic conditions marked by deficiency. To understand the limb zones\' nature, we will categorize them using these variables.',
      },
      {
        heading: 'Upper Limbs (Yang)',
        body: 'Zones 11 and 22 of the hands, located on the upper body (Yang) and upper extremities (Yang), exhibit a Yang within Yang character. These zones treat acute conditions.\n\nZone 44, situated on the upper body (Yang) proximal to the trunk (Yin), takes on a Yin within Yang character. This zone addresses chronic excess conditions.\n\nZone 33, intermediate to Zones 11-22 and Zone 44, shares characteristics of both zones. Thus, it can treat both acute and chronic deficiency conditions.',
        listItems: [
          'Zones 11, 22 — Yang in Yang (acute conditions)',
          'Zone 33 — Transition (acute and chronic)',
          'Zone 44 — Yin in Yang (chronic excess)',
        ],
      },
      {
        heading: 'Lower Limbs (Yin)',
        body: 'Zones 55 and 66 of the feet, located on the lower body (Yin) and lower extremities (Yang), exhibit a Yang within Yin character. Their points treat rising Yang conditions or excess Yang conditions in the upper body. Zones 55 and 66 (Yin) ground the Yang.\n\nZone 88 of the thighs, located on the lower body (Yin) nearest the trunk (Yin), exhibits a Yin within Yin character. It addresses chronic deficiency conditions and is considered the most fortifying zone in Master Tung\'s acupuncture.\n\nThe adult blood cell producer, bone marrow, is primarily located in the thigh, calf, and arm bones. This further explains the fortifying properties of Zones 88 (thighs), 77 (calves), and 44 (arms).\n\nZone 77, intermediate to Zones 55-66, and Zone 88 shares characteristics of both zones. Therefore, it treats both chronic deficiency and chronic excess conditions.',
        listItems: [
          'Zones 55, 66 — Yang in Yin (rising Yang, grounding)',
          'Zone 77 — Transition (chronic deficiency and excess)',
          'Zone 88 — Yin in Yin (most fortifying zone)',
        ],
      },
      {
        heading: 'Trunk',
        body: 'Zones VT and DT on the trunk address internal organ and limb disorders. These zones are bled, not needled, as Master Tung avoided needling the trunk to prevent harm to internal organs.',
      },
    ],
  },
  {
    id: 'master-tung-acupuncture',
    number: 2,
    title: 'דיקור מאסטר דונג',
    titleEn: "Master Tung's Acupuncture Channels",
    sections: [
      {
        body: 'In his writings, Master Tung did not elucidate the theoretical principles underpinning his family tradition. His students had to discover them independently. One of his students, Young Wei Chieh, writes on his website: "He did not talk much, to his patients or to his students. Every time questions were raised to him, he would say, \'Observe for yourself, then think about it.\'"',
      },
      {
        heading: 'The Fundamental Question',
        body: 'Master Tung titled his book Tung\'s Acupuncture and Moxibustion Channels and Extraordinary Acupuncture Points (Tung, 1973). A fundamental question arising from an attempt to understand the principles of his method concerns the nature of the primary channels in Master Tung\'s family tradition. Was he referring to the traditional 14 primary channels or a distinct channel system? There are two answers to this question, comprising two approaches:',
        listItems: [
          'Master Tung\'s points are extra points of the 14 primary channels.',
          'Master Tung\'s acupuncture is not rooted in the 14 primary channels but constitutes a separate tradition with its own channel system based on the five zang organs.',
        ],
      },
      {
        heading: 'Approach 1: Extra Points of the 14 Primary Channels',
        body: 'According to the first approach, Master Tung\'s points are extra points of the 14 channels, and the method\'s foundational principles align with these 14 primary channels. Each one of Master Tung\'s points can be situated on one of the 14 primary channels or between two channels. For instance, 22.04 Ling Gu resides on Arm Yangming, whereas 77.05 Yi Zhong is positioned between Leg Shaoyang and Leg Yangming.\n\nYoung Wei Chieh, a disciple of Master Tung, claims: "The term \'Orthodox Channels\' in the title of Master Tung\'s book is closely related to the traditional 14 channels. Since the 14 channels and the zang fu interconnect, there is an inseparable relationship between the 14 channels and the zangfu. Choosing points along the meridians in the 14 channels is the basic principle, and the technique of choosing points by syndrome differentiates treatment." (Young, 2014)',
      },
      {
        heading: 'Example: 22.11 Tu Shui',
        body: 'Young elucidates the mechanisms of the points\' actions through the channel theory. Consider 22.11 Tu Shui for treating gastritis, chronic stomach ailments, and tonsilitis. The point is located on Arm Taiyin, near Lu-10 Yu Ji. The Taiyin channel of the hand begins on the stomach (CV-12 Zhong Wan). Therefore, the point can be used to treat stomach diseases. Arm Taiyin also passes through the throat; therefore, like Lu-10 Yu Ji, the point can be used to treat tonsilitis.',
      },
      {
        heading: 'Interior-Exterior Relationships',
        body: 'The relationship between two channels passing through the legs or arms and exhibiting an interior-exterior relationship (Yin-Yang):',
        listItems: [
          'Arm Taiyin ↔ Arm Yangming',
          'Leg Taiyin ↔ Leg Yangming',
          'Arm Shaoyin ↔ Arm Taiyang',
          'Leg Shaoyin ↔ Leg Taiyang',
          'Arm Jueyin ↔ Arm Shaoyang',
          'Leg Jueyin ↔ Leg Shaoyang',
        ],
      },
      {
        body: 'For example, 22.05 Ling Gu, situated on Arm Yangming, has an interior-exterior relationship with Arm Taiyin (Lung). Therefore, the point can treat lung ailments and regulate Qi (as the Lungs govern Qi).',
      },
      {
        heading: 'Same-Name Relationships',
        body: 'Relationships exist between channels passing through the arm and leg that share the same name:',
        listItems: [
          'Arm Taiyin ↔ Leg Taiyin',
          'Arm Yangming ↔ Leg Yangming',
          'Arm Shaoyin ↔ Leg Shaoyin',
          'Arm Taiyang ↔ Leg Taiyang',
          'Arm Jueyin ↔ Leg Jueyin',
          'Arm Shaoyang ↔ Leg Shaoyang',
        ],
      },
      {
        body: 'Consider 77.08 Si Hua Shang, located on Leg Yangming (Stomach). The point can treat both stomach and lung ailments: (1) The channel is associated with the Earth phase, and Earth generates Metal (Lungs). (2) The same-name relationship between Leg Yangming and Arm Yangming shares an interior-exterior relationship with Arm Taiyin (Lungs).\n\nAnother example: 22.11 Tu Shui treats stomach and intestinal disorders. The point resides on Arm Taiyin, sharing a same-name relationship with Leg Taiyin. Leg Taiyin exhibits an interior-exterior relationship with Leg Yangming, a primary channel for treating stomach and intestinal ailments.',
      },
      {
        heading: 'Zang Fu Extraordinary Connections (Zang Fu Bei Tong)',
        body: 'Young developed the Zang Fu extraordinary connection needling technique. The concept is rooted in the work of Li Chuan from the Ming Dynasty and Tang Zong Hai from the Qing Dynasty, which explored the six organ relationships. Young applied these relationships to the 14 primary channels.\n\nThis concept is based on Chapter 6 of the Basic Questions (Su Wen), which presents a dialogue on the separation and union of Yin and Yang — the opening, closing, and pivot functions:',
        listItems: [
          'Leg Taiyang (open) ↔ Arm Taiyin (open)',
          'Arm Taiyang (open) ↔ Leg Taiyin (open)',
          'Leg Yangming (close) ↔ Arm Jueyin (close)',
          'Arm Yangming (close) ↔ Leg Jueyin (close)',
          'Leg Shaoyang (pivot) ↔ Arm Shaoyin (pivot)',
          'Arm Shaoyang (pivot) ↔ Leg Shaoyin (pivot)',
        ],
      },
      {
        body: 'For example, 77.08 Si Hua Shang can treat heart ailments. The point is located on Leg Yangming, which shares a Zang Fu Bei Tong relationship with Arm Jueyin (pericardium), a crucial channel for treating heart disorders.\n\nAnother example: 11.01 Da Jian treats Shan Qi (hernia). The point is on Arm Yangming, which shares a Zang Fu Bei Tong relationship with Leg Jueyin — a primary channel for treating Shan Qi disorders.',
      },
      {
        heading: 'Approach 2: The Five Channels',
        body: 'It is my contention that Master Tung\'s acupuncture is not based on the 14 primary channels but represents a distinct system. Master Tung\'s acupuncture channels can be explained using the 14 primary channels — I employed this approach and taught it for many years. Later, I realized that Master Tung\'s family acupuncture possesses its own tradition, diverging from the 14 primary channels. The channel system in Tung\'s family tradition is founded on the five Zang organs.\n\nMaster Tung writes in the introduction to his book: "The acupuncture technique passed down by my ancestor, Jing Chang, differs from the conventional \'fourteen meridians\' system and the corresponding \'three hundred and sixty-five acupoints,\' as the location of the acupoints is significantly different. My family\'s acupuncture tradition has a unique history and has developed into its own school." (Tung, 1973)',
      },
      {
        heading: 'Evidence from Master Tung\'s Writings',
        body: 'Master Tung explicitly stated that his family acupuncture is not rooted in the 14 primary channels. When titling his book The Unique Points of the Primary Channels [正經奇穴學], he was not referring to the 14 primary channels but to the primary channels of his family tradition.\n\nIn the opening to the introduction of his book, he wrote: "Acupuncture, with a long history of development, can be traced back to the time of Emperor Ren Zong of the Song Dynasty, who cast the \'Bronze Figure of Yu\'s Acupuncture Points.\' The \'Five Viscera Chart\' was also published for people to refer to, which promoted the development of acupuncture." (Tung, 1973)\n\nWhy does Master Tung mention the illustration of the five Zang organs and assert its advancement of acupuncture?',
      },
      {
        heading: 'Yuan Guo Ben\'s Revelation',
        body: 'Yuan Guo Ben, a student of Tung\'s who edited Master Tung\'s book in 1973, told Chuan-Min Wang that Master Tung\'s acupuncture possessed its own channel system and that Master Tung\'s unique points should not be treated as extra points of the 14 primary channels.\n\nChuan-Min Wang wrote: "Many people misunderstood that Tung\'s points are extra points of the 14 channels because they were not aware that Tung\'s Acupuncture has its own set of channels distributed along various regions of the body." (Wang, 2013)\n\nYuan Guo Ben gave him a document kept secret for 44 years — "Ching Chang\'s Unique Points and Special Cases" (Chen, 1964), compiled by Du Ren Chen, one of Master Tung\'s students. According to Du Ren Chen, Master Tung determined which points to employ mainly based on the affected Zang organ channel.',
      },
    ],
  },
  {
    id: 'innervation-shen-jing',
    number: 3,
    title: 'עצבוב (אזורי תגובה)',
    titleEn: 'Innervation (Reaction Area) — Shen Jing [神經]',
    sections: [
      {
        body: 'In the introduction to the lecture notes Master Tung published for his students in 1968, he wrote: "I made use of modern language to write this book to advocate the quintessence of Chinese culture and treat more severe and lingering illnesses." (Wang, 2011).\n\nWhen Master Tung published his book, Western Medicine was more widely accepted than Chinese Medicine. Therefore, he employed the term "innervation" borrowed from Western Medicine and translated as Shen Jing [神經]. He substituted the traditional Chinese Medicine term "channel" with "nerve." In an earlier work (Chen, 1964), he still used the term "channel."',
      },
      {
        heading: 'A Unique Approach',
        body: 'Master Tung\'s book (Tung, 1973) provides descriptions of each point, including location, anatomy, indications, finding techniques, needle insertion, and notes. The anatomy section not only identifies the nerves along the point\'s pathway but also assigns a specific innervation to one of the Zang organs. This unique approach involving point innervation distinguishes Master Tung\'s acupuncture from traditional acupuncture methods.\n\nFor instance, 66.04 Huo Zhu is innervated by the sensory peroneal nerve, the dorsal phalangeal nerve, and the cardiac branch nerve. While the peroneal and dorsal phalangeal nerves do traverse the point\'s pathway, the cardiac branch nerve is not anatomically present in that area; in fact, there is no such nerve. Master Tung simply used Western terms to describe his channels. The point\'s innervation, therefore, serves as an indicator of its channel affiliation.',
      },
      {
        heading: 'Innervation Categories',
        body: 'The points\' innervations can be categorized into four groups:',
      },
      {
        heading: '1. The Five Zang Organs',
        body: 'Most points innervate the five Zang organs. A point can innervate a single organ or, in some cases, multiple organs. For instance, 88.17 Sima Zhong primarily innervates the lungs with a sub-branch to the liver.',
      },
      {
        heading: '2. The Fu Organs',
        body: 'Some points innervate the six Fu organs. Master Tung often does not specify which Fu organ he refers to. For example, 11.02 Xiao Jian innervates the six Fu organs. The Zang organs store, whereas the Fu organs transport and eliminate waste. Consequently, points innervating the six Fu organs can treat symptoms related to excess conditions, such as 11.02 Xian Jian (yellow mucus and bloating), and 66.05 Men Jin (stagnation in the lower heater).',
      },
      {
        heading: '3. The Extraordinary Fu Organs',
        body: 'Some points also innervate the extraordinary Fu organs, which store essence, such as the uterus, brain, and bones. For instance, 11.24 Fu Ke, a central point for treating the female reproductive system, innervates the uterus, while 77.01 Zheng Jin innervates the spine and brain.',
      },
      {
        heading: '4. Specific Nerves and Regions',
        body: 'Some points innervate a specific nerve or region. For example, 88.20-22 San Quan innervate the lungs and the facial motor nerve, making them important for treating facial paralysis. Qi Li (88) innervates the movement of the four limbs.',
      },
      {
        heading: 'Hierarchy of Innervation',
        body: 'Master Tung categorized organ innervations into six types, arranged hierarchically to represent the degree of influence a point has on an organ: first-place innervations have the greatest influence, while sixth-place innervations have the least.',
        listItems: [
          'Primary nerve — [總神] Zong Shenjing',
          'Nerve — [神經] Shenjing',
          'Auxiliary nerve — [副神經] Fu Shenjing',
          'Branch nerve — [支神經] Zhi Shenjing',
          'Sub-branch nerve — [分支神經] Fenzhi Shenjing',
          'Nerve intersection — [交叉正經] Jiaocha Zhengjing',
        ],
      },
      {
        body: 'A point can influence multiple nerves at different levels. For instance, the primary nerve of 88.17 Sima Zhong is the lungs, while its sub-branch nerve is the liver. This indicates that the point primarily influences the lungs, with a secondary influence on the liver.',
      },
      {
        heading: 'Mutual Influence Between Same Innervation Areas',
        body: 'An additional, lesser-known principle in Master Tung\'s acupuncture is the mutual influence between areas with the same innervation. According to this principle, points with the same innervation can influence the areas where they reside.\n\nFor instance, 77.01 Zheng Jin and Shiba Xing (DT) both have cranial innervations and therefore mutually influence each other. 77.01 Zheng Jin is situated on the Achilles tendon and can treat neck pain, as Shiba Xing (DT) is located on the dorsal aspect of the neck. Conversely, Shiba Xing (DT) can treat inflammation in the Achilles tendon.',
      },
      {
        heading: 'Point Names — The Five Phases',
        body: 'Many point names provide additional clues about their influence on the five Zang organs. Points with the marker Jin (metal) influence the lungs, Shui (water) the kidneys, Mu (wood) the liver, Huo (fire) the heart, and Tu (earth) the spleen.',
        listItems: [
          '11.17 Mu "Wood" — treats hyperactive liver fire',
          'Tu Xing (11) "To enrich the earth" — treats stomach and spleen ailments',
          '66.10 Huo Lian, 66.01 Huo Ju, 66.12 Huo San — "fire" points treat excess fire (Yang) in the upper body: palpitations, hypertension, insomnia',
          '22.11 Tu Shui "Earth water" — treats earth (spleen-moisture) and water (kidney-cold) disorders',
        ],
      },
      {
        heading: 'Point Names — Organ',
        body: 'Organ names appear in certain point names, indicating their influence on that organ.',
        listItems: [
          '11.19 Xin Chang "Normal heart" — treats arrhythmia, palpitations, heart disease',
          '88.09 Tong Shen "To penetrate the kidney" — treats kidney diseases: nephritis, edema',
          '11.13 Dan "Gallbladder" — treats feelings of a full stomach, jaundice, anxiety, palpitations',
          'Zheng Nao (77) "Brain alignment" — treats brain disorders',
        ],
      },
      {
        heading: 'Point Names — Numbers (Yellow River Diagram)',
        body: 'Many points in Master Tung\'s acupuncture have numbers in their names. These numbers are references to the Yellow River Diagram (Hetu) [河圖] and indicate a connection to one of the five Zang organs.\n\nEach of the ten numbers is connected to one of the five phases:',
        listItems: [
          '1 and 6 — Water (Kidneys)',
          '2 and 7 — Fire (Heart)',
          '3 and 8 — Wood (Liver)',
          '4 and 9 — Metal (Lungs)',
          '5 and 10 — Earth (Spleen)',
        ],
      },
      {
        heading: 'Number Examples',
        body: 'Points with numbers in their names reference the Yellow River Diagram:',
        listItems: [
          '88.17-19 Sima "Four horses" — 4 is associated with the lungs; important points for strengthening the lungs',
          '11.12 Er Jiao Ming "Two bright corners" — 2 is associated with the heart; located on the middle finger (heart)',
          '77.26 Qi Hu "Seven tigers" — 7 is the number of the heart; the tiger relates to lungs; influences ribs and chest',
          '66.08 Liu Wan "Sixth completion" — 6 is related to water-kidneys; stops bleeding due to the storing and contracting nature of the kidneys',
        ],
      },
      {
        heading: 'Point Names — Function and Location',
        body: 'Some points\' names hint at their function or location:',
        listItems: [
          '11.24 Fu Ke "Specialization in women" — important for gynecological disorders',
          'San Zheng Ji (44) "Spine straightening" — important for spinal disorders',
          '11.20 Mu Yan "Wood inflammation" — treats liver inflammation and hyperactive liver fire',
          '11.18 Pi Zhong "Enlarged spleen" — treats an enlarged spleen',
          '77.01 Zheng Jin "Tendon straightening" — located on the Achilles tendon',
          '22.05 Ling Gu "Wise bone" — proximal to the first and second metacarpals',
          '77.22 Ce San Li "Beside the three miles" — located next to St 36 Zu San Li',
          '44.06 Jian Zhong "Center of the shoulder" — located at the center of the deltoid',
        ],
      },
    ],
  },
  {
    id: 'dao-ma-technique',
    number: 4,
    title: 'טכניקת דאו מא',
    titleEn: 'Dao Ma Needling Technique',
    sections: [
      {
        body: 'Dao Ma Zhen Fa [倒馬針法], or the Dao Ma Needling Technique, is unique to Master Tung\'s acupuncture. This technique involves inserting two to six needles along the same line, which can be vertical, horizontal, or diagonal. The Dao Ma needling technique is first mentioned in Tung\'s clinical records of his treatment of Cambodian Prime Minister Marshal Lon Nol (Tung, 1971). In his book (Tung, 1973), Tung refers to the technique by a different name, Hui Ma [回馬].\n\nThe technique is described twice in the book: once under point 44.03 Shao Ying: "44.02 Hou Zhui and 44.03 Shou Ying are needled together in a technique called Hui Ma; then the effect is quick and successful," and again under points 77.05-07 San Zhong: "77.05-07 Yi Zhong, 77.06 Er Zhong, and 77.07 San Zhong are needled together in a technique called Hui Ma to treat the ailments mentioned in the point indications."\n\nHui [回] means "to return" and Ma [馬] means "horse." Therefore, Hui Ma translates to "returning horse." Given that many of Master Tung\'s points include the character "horse," and horses are known for their speed, Master Tung may have used this character to allude to the rapid effects of the Dao Ma technique.\n\nWhy "returning horse"? In Dao Ma, two to six needles are inserted in the same zone. After inserting the first needle, instead of moving to another zone, one returns to the initial zone to insert additional needles.\n\nToday the technique is commonly termed Dao Ma. Dao [倒] means "to reverse" or "to go back," making Dao Ma potentially translatable as "fallen horse" or "returning horse." Some argue that "fallen horse" is more accurate because toppling a horse requires removing a leg. Since the Dao Ma needling technique usually involves three needles, these could symbolize a horse\'s three fallen legs.',
      },
      {
        heading: 'Treating a Broad Area',
        body: 'Needling two to six points at one site expands the treatment area. A single needle treats a small area, two needles cover a larger area, and three needles, an even broader area.',
      },
      {
        heading: 'The Dao Ma Needling Technique and Master Tung\'s Channels',
        body: 'Master Tung\'s acupuncture points are organized into Dao Ma groups along the same line, each representing a channel. Points within a Dao Ma group share the same innervation, and a group\'s innervation indicates its channel.\n\nFor example, the Dao Ma group on the thigh comprises six points:',
        listItems: [
          'Tong Xin (88)',
          'Tong Ling (88)',
          '88.01 Tong Guan',
          '88.02 Tong Shan',
          '88.03 Tong Tian',
          'Shang Tong Tian (88)',
        ],
      },
      {
        body: 'All these points, located along a line passing through the center of the thigh, innervate the heart. Therefore, this line represents the heart channel on the thigh. Additional heart channels exist in other zones, such as Xin Ling (33) on the inner forearm and 33.04-06 Shou San Huo on the outer forearm.\n\nIn the acupuncture of the 14 primary channels, the channels pass through the upper and lower limbs in a continuous line, ultimately connecting to the internal organs. Master Tung\'s channels vary in length, with channels along the fingers as short as one cun and longer channels reaching nine cun. The five channels can be found on both the lower and upper limbs, in nearly all ten zones. These channels do not make up one continuous line but are divided into short lines made up of Dao Ma groups. Also, they do not connect to the internal organs.',
      },
      {
        heading: 'Reflex Areas',
        body: 'Since Master Tung\'s acupuncture channels do not have internal pathways connecting to the internal organs, the Dao Ma groups are actually reflex areas. Reflex areas are areas on the body that correspond to internal organs and related systems. Stimulating the reflex area through pressure, needling, or bloodletting can improve the functioning of the associated organs or body systems. In addition, changes can develop in the reflex areas due to impaired functioning of the associated organs and body systems.\n\nMaster Tung believed that in chronic illnesses, the connective tissue loses flexibility and vitality, resulting in Bi Zheng [痹证]. Bi [痹] means blockage, and Bi Zheng refers to rheumatism, which is harm to the connective tissue of the muscles, joints, skin, and other organs. Due to pathologies of the organs and associated systems, rheumatism develops in the Dao Ma groups.\n\nIn the English-translated version of Master Tung\'s book, Paldan Dechen chose to translate the term "innervation" to "reaction area" (Dechen, 1973). This term is more appropriate because Dao Ma groups react to changes in the organs and body systems related to them.\n\nIn summary, Master Tung\'s acupuncture channels are distinct from the acupuncture of the 14 primary channels. The channels are reaction (reflex) areas on the surface of the body that can reflect an imbalance or disease of the inner organs and systems related to them. Needling these areas can help the body return to balance and activate its healing capacities.',
      },
      {
        heading: 'Ancient Roots',
        body: 'One of the most fascinating questions regarding the history of acupuncture is the order of its development \u2013 did acupuncture points or channels come first? Until 1972, the prevailing belief was that points were discovered initially, and then channels were mapped out to connect them.\n\nHowever, findings at the archaeological site of Ma Wang Dui [马王堆] in China led to a shift in this perspective. Excavated in 1972, three Han dynasty tombs (206 BCE \u2013 9 CE) yielded medical and philosophical texts on silk, bamboo, and wood. Among seven medical texts found in the third tomb were three silk scrolls, one describing eleven channels, including their pathways and associated diseases, with no reference to acupuncture points. This is the earliest known reference to channels, resulting in a conceptual shift.\n\nNowadays, scholars contend that the concept of channels preceded that of acupuncture points. These books were written before the transition to using needles, when bloodletting and moxibustion were used on different areas along the channels. Later, after needles were already in use, these areas narrowed to points. In the Dao Ma needling technique, we also treat areas, as done in the past. Therefore, using this needling technique in Master Tung\'s acupuncture hints at its ancient roots.\n\nThe texts from Ma Wang Dui also include another component that resembles Master Tung\'s acupuncture. Like in Master Tung\'s acupuncture, the eleven channels have no internal pathways connecting to the organs. The areas on the channels where moxibustion and bloodletting were applied are similar to reflex areas in Master Tung\'s acupuncture.',
      },
      {
        heading: 'Treatment',
        body: 'To treat changes in the connective tissue, Master Tung used two techniques: needling and bloodletting. Because rheumatism at the site of the Dao Ma groups can develop in a broad area, Master Tung realized that one needle wasn\'t enough. Therefore, he developed the Dao Ma needling technique. He found this technique effective for releasing blockages, influencing all the organs in the body, and increasing De Qi [得氣].\n\nFurthermore, if Luo-Connecting Channels appeared along the route of the Dao Ma group, Master Tung would treat them by bloodletting. Luo channels are dark or red veins appearing at the skin\'s surface, sometimes in the form of Spider Angioma.',
      },
      {
        heading: 'Triangular Arrangement',
        body: 'In the Dao Ma Needling Technique, the needles can be arranged in two ways. The first, as mentioned earlier, is needling the points along the same line. The second is the triangular arrangement, where the needles are arranged in the shape of a triangle.\n\nTwo of the needles are placed linearly within the same Dao Ma group. The third needle, called the "lead," is placed at the peak of the triangle, next to the Dao Ma group. This technique allows for covering a broader area. Therefore, the triangular arrangement is used when the affected area is broad.',
      },
      {
        heading: 'Advancing Free Flow in the Three Heaters',
        body: 'Three Chinese philosophical concepts describe the nature of the cosmos: Wuji, Taiji, and Liangyi.\n\nWuji [無極] is a nonpolar state. Wu [無] means "without" and Ji [極] means "extreme" or "pole." Wuji is an intangible, formless state with no beginning, no end, no sound, no color, and no name. It represents emptiness containing balance \u2014 the primordial energy. The term comes from Chapter 28 of Lao Zi\'s Dao De Jing: "Return to the state of boundlessness [復歸於無極]."\n\nTaiji [太極] is absolute polarity. It is a polar energetic state containing Yin and Yang energy unseparated from the infinite potential. Zhu Xi [朱熹], a philosopher from the Song dynasty, said that Taiji is the main principle of the universe.\n\nLiangyi [兩儀] represents heaven and earth, Yin and Yang. It describes a state where Yin and Yang are separated \u2014 soft and hard, hot and cold, slow and fast, positive and negative.\n\nTaiji is a state between Wuji and Liangyi, connecting the two. All three describe the creation of the universe:',
        listItems: [
          'Wuji gives birth to Taiji',
          'Taiji gives birth to Liangyi',
          'Liangyi gives birth to the Four Symbols (Sixiang)',
          'The Four Symbols give birth to the Eight Trigrams',
          'The Eight Trigrams give birth to the 64 Hexagrams',
          'The 64 Hexagrams give birth to ten thousand things',
        ],
      },
      {
        heading: 'The Three Heaters in the Dao Ma Technique',
        body: 'There is a saying: "Within the great Taiji, there are countless small Taijis." Each part of the body can reflect the body as a whole. This principle is found in pulse diagnosis, where three fingers on the radial artery represent the three heaters (cun = upper, guan = middle, chi = lower). The same principle is applied in tongue diagnosis.\n\nWhen we use three needles in the Dao Ma technique, we also treat the three heaters. Therefore, the Dao Ma technique advances free flow among the three heaters and strengthens all the organs.\n\nFor instance, 88.17-19 Sima are three important points for strengthening the lungs. When needling all three points together, we strengthen the lungs while influencing the whole body. The upper point treats the upper part of the lungs, the middle point the middle, and the lower point the lower part. Simultaneously, the upper point treats the upper heater, the middle point the middle heater, and the lower point the lower heater.\n\nThe point names can also reflect the three heaters through Tian (Heaven) \u2013 Di (Earth) \u2013 Ren (Human). For instance, in 77.17, 19, 21 Xia San Huang: 77.17 Tian Huang "Heavenly Emperor," 77.19 Di Huang "Earth Emperor," and 77.21 Ren Huang "Human Emperor." Master Tung uses the concept from Chapter 25 of Lao Zi\'s Dao De Jing: "Humans follow the laws of Earth, Earth follows the laws of Tao, Tao follows the laws of nature."',
      },
      {
        heading: 'The Undefined Point Needling Technique',
        body: 'The Undefined Point Needling Technique (Buding Xue Zhen Fa [不定穴针法]) is a masterpiece of Master Tung\'s acupuncture, comprising a cornerstone of the method.\n\nMaster Tung used this technique in one of his treatments for Cambodian Prime Minister Lon Nol, who suffered from hemiplegia and coldness in the leg following a stroke. Master Tung examined the back of his hand and saw a blue vein at the tip of his middle finger. He needled the site of the vein, and immediately afterward, Lon Nol sensed heat from his knee to beneath his foot. The point was unknown until that moment, and afterward, Master Tung named it 11.10 Mu Huo.\n\nThis technique exemplifies the flexibility of Master Tung\'s approach. Master Tung used to say: "Disease is not ingrained in the body. It can be accessed and eliminated. Whoever says disease cannot be healed, has not yet mastered the technique." (Young)\n\nThe technique utilizes an undefined location, and the points are found by focusing on the external expression of the disease. When Master Tung encountered severe and complicated diseases, he focused for a moment, and when his mind was clear, he sought the undefined acupuncture points, needled or employed bloodletting, and sometimes managed to eliminate the disease.',
      },
      {
        heading: 'The External Expression of a Disease',
        body: 'Chapter 5 of the Basic Questions (Su Wen) states: "Those who know well how to use the needles\u2026 from the exterior they know the interior. By observing the structures of excess and inadequacy, they see the minute and notice the excess."\n\nThis principle \u2014 that the exterior reflects the interior \u2014 is central to Master Tung\'s acupuncture. Huo Wen Zhi, one of Master Tung\'s students, wrote: "Non-existing points without a location are superior to existing points with a location [無穴無位勝有穴有位]."\n\nNeedling a point solely based on its textbook location is less effective than selecting a point through tactile examination and observation. Points are chosen more flexibly: we observe, palpate a Dao Ma group, and pinpoint the External Expression of the Disease. If the disease is localized in a small area, one or two points are sufficient. If the external expression spreads over a broad area, two points at opposite ends and one in the middle are typically used.',
      },
      {
        heading: 'Identifying the External Expression',
        body: 'The External Expression of the Disease is identified through observation and touch:',
        listItems: [
          'Observation \u2014 Inspecting the skin\'s surface for stains, pigmentation, and Luo-Connecting Channels (dark or red veins, sometimes in the form of Spider Angioma)',
          'Touch \u2014 Applying pressure to detect sensitivity or changes in connective tissue (hardening, nodules)',
          'Vascular Autonomic Signal (VAS) \u2014 A diagnostic pulse technique for identifying active Dao Ma groups',
        ],
      },
      {
        heading: 'The Vascular Autonomic Signal (VAS)',
        body: 'Dr. Paul Nogier, a French doctor who taught neurology in Lyon, discovered the Vascular Autonomic Signal (VAS) in 1966. His interest in auriculotherapy began in 1957 after witnessing its effectiveness in treating sciatica.\n\nWhile searching for active points in the ear using a detection device, Nogier simultaneously took the patient\'s pulse and noticed a change \u2014 the pulse intensified for several beats before returning to its original state. He initially termed it Reflexe Auriculo Cardiaque (RAC), later changing it to "Vascular Autonomic Signal" after observing the phenomenon in all arteries.\n\nThe VAS is the neurovascular system\'s physiological response to information conveyed to its energetic field \u2014 essentially a Fight or Flight Response of the Autonomic Nervous System. It is most easily felt in the radial artery near the wrist.\n\nWays to stimulate acupoints to check for activity:',
        listItems: [
          'Mechanical pressure using an ear probe with a round head',
          'Laser light projection on the point',
          'Placing the tip of the needle several millimeters above the point',
          'Bahr 3V hammer \u2014 A manual device with two poles creating an electrical field between the rod and the examined skin',
        ],
      },
      {
        heading: 'Searching for the External Expression of the Disease',
        body: 'Generally, there are two approaches to point selection: the "scientist\'s way" and the "artist\'s way." The scientist relies on clinical experience, embodied by point indications collected over generations. The artist\'s way involves searching for the External Expression of the Disease through touch and observation, without relying on intellectual analysis.\n\nThe recommended approach combines both: base the search on clinical experience, initially focusing on Dao Ma groups with relevant indications. Then use the artist\'s way to scan for the External Expression of the Disease and identify the specific area to needle.\n\nWhen internal organs become imbalanced, physical changes in the Dao Ma groups may not be immediately detectable. Initially, changes are subtle and detectable through VAS. Over time, as organs fail to regain balance, physical changes in the connective tissue develop:',
        listItems: [
          'A higher concentration of hairs at the site of the point relative to the surrounding area',
          'Changes in skin color, sometimes appearing as small stains around the point',
          'Swelling at the site of a point, often spreading across several points within a Dao Ma group',
          'Growth in the point\'s diameter, and sometimes a cluster of nodules that feels like small bubbles',
        ],
      },
      {
        body: 'Active points are not situated exactly as defined in the books. This renewed observation allows needling at a more precise location, applying Huo Wen Zhi\'s saying: "Non-existing points without a location are superior to existing points with a location."\n\nNotes:\n[1] The ten zones refer to all the zones except for DT and VT.\n[2] The Fight or Flight response is an automatic physical response that occurs when a person or animal feels threatened, preparing the body by releasing hormones such as Adrenaline and Cortisol and activating the Autonomic Nervous System.',
      },
    ],
  },
  {
    id: 'imaging-holographic',
    number: 5,
    title: 'הדמיה — הולוגרפית',
    titleEn: 'Imaging — Holographic',
    sections: [
      {
        body: 'One of the core principles of Chinese medicine is the interconnectedness of Heaven, Earth, and Humanity. According to this perspective, the human is a reflection of Heaven and Earth. As Song dynasty philosopher Zhu Xi stated: "Everything has a highest standard [above physical form], which is principle li [理]. All principles in the world constitute taiji" and "For Heaven and Earth, the whole world has a taiji inside; for everything, has a taiji inside [在天地言，则天地中有太极；在万物言，则万物中各有太极]" (Feng, 2005).\n\nIn Taiji theory, the whole contains the part, and the part contains the whole; therefore, the whole body is reflected in each of its parts. This principle extends to the cellular level, with the DNA encapsulating information about the entire system.\n\nVarious treatment modalities \u2014 such as scalp, face, ear, eye, nose, mouth, tongue, chest, stomach, hand, and foot acupuncture \u2014 are based on this principle. These modalities, often categorized as microsystems or holographic acupuncture, reflect a general physiological concept where the whole body is represented in its parts. This relationship is dynamic and reciprocal: a pathological change in the entire organism manifests as a corresponding change in each microsystem, and interventions in one microsystem can influence the entire organism.\n\nThis same principle underlies Master Tung\'s acupuncture, which integrates the external expression of the disease, Dao Ma groups, and diagnosis. Although Master Tung was likely unfamiliar with the specific term "microsystems," the concept is implicit in his acupuncture. Each of the 12 zones is a microsystem of the whole body. Young Wei Chieh and Lee Kuo Cheng later incorporated holographic acupuncture into Master Tung\'s technique, developing several imaging methods.',
      },
      {
        heading: 'Imaging Between the Right and Left Limbs',
        body: 'The right hand mirrors the left hand, and the left hand mirrors the right hand. Similarly, the right leg mirrors the left leg, and the left leg mirrors the right leg.',
        listItems: [
          'The right elbow can be treated by needling the left elbow, and vice versa',
          'The right arm can be treated by needling the left arm, and vice versa',
          'The right forearm can be treated by needling the left forearm, and vice versa',
          'The right knee can be treated by needling the left knee, and vice versa',
          'The right thigh can be treated by needling the left thigh, and vice versa',
          'The right lower leg can be treated by needling the left lower leg, and vice versa',
        ],
      },
      {
        heading: 'Inverted Reflection of the Limbs',
        body: 'This reflection can be inverted around the elbow. In an inverted reflection, the hand mirrors the opposite shoulder, the forearm mirrors the opposite arm, the elbow mirrors the opposite forearm, and the shoulder mirrors the opposite hand.',
        listItems: [
          'The right shoulder can be treated by needling the left hand, and vice versa',
          'The right forearm can be treated by needling the left arm, and vice versa',
        ],
      },
      {
        body: 'In an inverted reflection of the lower limbs, the foot mirrors the opposite hip joint, the lower leg mirrors the opposite thigh, the knee mirrors the opposite knee, the thigh mirrors the opposite shin, and the hip joint mirrors the opposite foot.',
        listItems: [
          'The right hip joint can be treated by needling the left foot, and vice versa',
          'The right thigh can be treated by needling the left lower leg, and vice versa',
        ],
      },
      {
        heading: 'Imaging Between the Upper and Lower Limbs',
        body: 'The upper limbs mirror the lower limbs, and vice versa. The hand mirrors the opposite hip joint, the forearm mirrors the opposite thigh, the elbow mirrors the opposite knee, the arm mirrors the opposite lower leg, and the shoulder mirrors the opposite foot.',
        listItems: [
          'The right knee can be treated by needling the left elbow, and vice versa',
          'The right hand can be treated by needling the left hip joint, and vice versa',
          'The right forearm can be treated by needling the left thigh, and vice versa',
          'The right arm can be treated by needling the left lower leg, and vice versa',
        ],
      },
      {
        heading: 'Imaging Between the Limbs and the Neck and Trunk',
        body: 'In Master Tung\'s acupuncture, "Taiji" refers to the navel as the center. The area above the navel reflects the Upper Heater, while the area below reflects the Lower Heater.\n\nThe neck and trunk can mirror the upper limbs: the shoulder mirrors the head, the arm mirrors the chest and epigastrium, the elbow mirrors the navel, the forearm mirrors the lower abdomen, and the hand mirrors the genitalia.\n\nSimilarly, the neck and trunk can mirror the lower limbs: the hip joint mirrors the head, the thigh mirrors the chest and epigastrium, the knee mirrors the navel, the lower leg mirrors the lower abdomen, and the foot mirrors the genitalia.',
        listItems: [
          'The right side of the head can be treated by needling the left shoulder or left thigh',
          'The right side of the chest can be treated by needling the left arm or right lower leg',
          'The right lower abdomen can be treated by needling the left forearm or left lower leg',
        ],
      },
      {
        heading: 'Inverted Trunk Imaging',
        body: 'This reflection can be inverted: the hand and foot mirror the head, the forearm and lower leg mirror the chest, the elbow and knee mirror the navel, the arm and thigh mirror the lower abdomen, and the shoulder and hip joint mirror the genitalia.',
        listItems: [
          'The right side of the head can be treated by needling the left hand or left foot',
          'The left side of the chest can be treated by needling the left forearm or right lower leg',
          'The right lower abdomen can be treated by needling the left arm or left thigh',
        ],
      },
      {
        heading: 'Directional Mirroring',
        body: 'The anterior side mirrors the anterior, the lateral side mirrors the lateral, the posterior side mirrors the posterior, and the medial side mirrors the medial.',
        listItems: [
          'Right anterior head \u2192 lateral side of the left hand (22.04 Da Bai, 22.05 Ling Gu), or anterior (dorsal) side of the left foot, Liu Xi (66)',
          'Lateral right chest \u2192 lateral side of the left forearm (33.04-06 Shou San Huo) or lateral left thigh, 88.25 Zhong Jiu Li, Qi Li (88)',
          'Right lower back \u2192 posterior side of the left forearm (33.10-12 San Men) or posterior left lower leg (77.03 Zheng Shi, 77.02 Zheng Zong)',
        ],
      },
      {
        heading: 'Small Taiji \u2014 Bio-Holographic Theory',
        body: 'In 1973, Ying Qing-Zhang, a professor from Shandong University in China, discovered a new group of acupuncture points along the second metacarpal bone. This bone represents a small human figure, with the metacarpophalangeal joint corresponding to the head and the opposite end representing the foot.\n\nBased on this discovery, Ying Qing-Zhang developed the bio-holographic theory, termed "Embryo Containing the Information of the Whole Organism" (ECIWO). This theory is based on the principles of holographic photography technology, where each part of the film contains an image of the whole object being photographed.\n\nThe bio-holographic theory is founded on the hypothesis that living organisms have a mosaic structure composed of parts with embryonic properties that contain information about the entire organism. ECIWO provides an explanation for acupuncture microsystems and offers a new scientific basis for acupuncture research (Schjelderup, 1992).\n\nBeyond the second metacarpal bone, such biosystems can be identified on all metacarpal and metatarsal bones, and on all long bones such as the tibia and fibula. This concept aligns with Master Tung\'s acupuncture, where most points are located near the bones of the limbs.',
      },
    ],
  },
  {
    id: 'palm-diagnosis',
    number: 6,
    title: 'אבחון כף יד',
    titleEn: "Palm Diagnosis",
    sections: [
      {
        heading: 'Treating the Root of the Disease',
        body: 'The primary treatment strategy used by Master Tung is to treat the root of the disease. In Chapter 5 of the Basic Questions, it is written: "To treat diseases, one must search for the basis" (Unschuld, Tessenow, 2011).\n\nBiao Ben [標本], or root and tip, are central concepts in Chinese medicine. The character Biao [標] means "upper branch," "mark," or "lighthouse," and Ben [本] means "root" or "source." The definitions change depending on context:',
        listItems: [
          'The root refers to the essential nature of the disease; the tip refers to the symptoms',
          'The root is the source of the disease; the tip is observable clinical changes',
          'The root refers to Zheng Qi [正氣] (Qi that resists disease); the tip refers to Xie Qi [邪氣] (malicious Qi)',
          'The root is the primary cause; the tip is the secondary cause',
        ],
      },
      {
        body: 'In Master Tung\'s acupuncture, the root of the disease is located in the Five Zang organs, while the tip is reflected in the external expression of the disease. Diagnosing the root is crucial to the treatment\'s success. The diagnosis is based on the Five Zang organs, with the goal of understanding the pathogenesis, or Bing Ji [病機], which may not necessarily be related to the patient\'s symptoms.',
      },
      {
        heading: 'Master Tung\'s Diagnostic Method',
        body: 'At the 1962 International Acupuncture Congress, Master Tung described his diagnostic method: "Tung\'s diagnostic method is to check the color of both hands and arms first, and then look at the color of both sides of the face. Both of them can be combined to diagnose the disease and symptoms, and then acupoints are selected according to the channel" (Chein, 2023).\n\nMaster Tung diagnosed by observing the face and palms, and in difficult cases, he also used pulse diagnosis. He did not document his diagnostic methods in his book (Tung, 1973). Instead, this information is passed down orally, as observation-based diagnostic methods must be taught in a clinical setting.',
      },
      {
        heading: 'Palm Diagnosis',
        body: 'Palm diagnosis in the Chinese medicine tradition is based on the concept that what occurs inside the body can be reflected on its surface and that the whole body is contained in each of its parts (the Taiji concept). The hand accumulates a significant amount of information from the whole body, including both normal and abnormal activity.\n\nWhen Master Tung introduced the 12 zones in his book, he began with Zone 11 (the fingers). With five fingers on each hand, each finger represents one of the five organs:',
        listItems: [
          'First finger (thumb) — Spleen',
          'Second finger (index) — Lungs',
          'Third finger (middle) — Heart',
          'Fourth finger (ring) — Liver',
          'Fifth finger (little) — Kidneys',
        ],
      },
      {
        heading: 'First Finger \u2014 Thumb (Spleen)',
        body: 'The neck is represented by the area where the thumb and first metacarpal bone meet, the Huai Ling (11) area. Blood vessels here can indicate Blood stagnation.\n\nThe thumb and first metacarpal bone represent the Spleen. In Chinese medicine, the Spleen-pancreas has a significant relationship with the digestive system. The digestive system is diagnosed at the first metacarpal bone. The small intestine is diagnosed at the base of the metacarpal bone (at the wrist), while the large intestine is diagnosed just above it, toward the thumb. The point 22.11 Tu Shui, which can treat Stomach and Intestine diseases, is also located in this area.',
      },
      {
        heading: 'Second Finger \u2014 Index Finger (Lungs)',
        body: 'The second finger represents the Lungs, diagnosed on the palm at the base of the second finger. The throat and trachea are diagnosed on the radial aspect of the palm. Jin Xing (22) treats Lung diseases including tuberculosis, emphysema, asthma, and bronchitis.\n\nAllergic asthma is diagnosed on the radial aspect of the second finger, at the first section (Line B), where points 11.01-02 Da/Xiao Jian and Ce Jian (11) are situated.\n\nThe diagnostic zone for the male reproductive system is located at the third segment of the second finger (Line A). San Yang (11), Nei/Chen Yin (11) are found in this zone.\n\nThe digestive system is represented by the line extending from the throat zone toward the wrist, running radially along the Life Line. The stomach is at the upper part, while the duodenum, small intestine, and large intestine are found before the curve toward the first metacarpal bone.',
      },
      {
        heading: 'Third Finger \u2014 Middle Finger (Heart)',
        body: 'The third finger represents the Heart, diagnosed on the palm at the base of the finger. On the first segment are two significant groups for treating Heart diseases: 11.19 Xin Chang and Huo Long (11). Between the palm and wrist on the third metacarpal are San Huo (22), which can treat arrhythmias and rheumatic heart disease.',
      },
      {
        heading: 'Fourth Finger \u2014 Ring Finger (Liver)',
        body: 'The fourth finger represents the Liver, diagnosed on the palm below the base of the finger. San He (22) points treat Gallbladder diseases. On the ulnar side (Line D), 11.20 Mu Yan points treat hepatitis, liver cirrhosis, and enlarged liver. On the opposite side (Line B), 11.21 San Yan treats digestive disorders. San Xing (22) treats hypochondrium pain, jaundice, hepatitis, and bitter taste.\n\nThe diagnostic zone for the female reproductive system is on the lateral-radial side of the first segment (Line A), where Feng Chao (11) points are found. Another diagnostic area is the distal forearm, from the wrist to Xin Ling (33).',
      },
      {
        heading: 'Fifth Finger \u2014 Little Finger (Kidneys)',
        body: 'The fifth finger represents the Kidneys, diagnosed on the palm below the finger. Fen Shui (11) and Shui Qing (11) treat Kidney diseases. San Hai (22) points treat Kidney and Bladder disorders.\n\nThe Spleen is diagnosed at the center of the space between the fourth and fifth metacarpal bones. Blood vessels are often found here, indicating Spleen-related illnesses.\n\nThe spine and Kidneys are diagnosed on the ulnar aspect of the fifth metacarpal bone, where 22.08-09 Wan Shun Yi/Er are located. The upper spine is near the base of the finger (22.08), while the lower spine is near the wrist (22.09).',
      },
      {
        heading: 'What to Look For',
        body: 'When performing Palm diagnosis, we look for color changes, the appearance of veins, and any areas that are more prominent or sunken.',
      },
      {
        heading: 'Color Changes',
        body: 'Colors or color stains on the hand provide diagnostic clues based on their location:',
        listItems: [
          'White \u2014 Coldness, deficiency',
          'Red \u2014 Heat, excess',
          'Green-blue \u2014 Coldness, deficiency (the darker, the more severe)',
          'Red and purple \u2014 Heat, inflammation',
          'Red and yellow \u2014 Heat',
          'Light black \u2014 Dampness and Coldness',
          'Blue and black \u2014 Pain',
          'Purple stains \u2014 Blood stagnation',
        ],
      },
      {
        heading: 'Veins',
        body: 'The appearance of veins provides diagnostic clues:',
        listItems: [
          'Green-blue \u2014 Coldness, deficiency (the darker, the more severe)',
          'Red and purple \u2014 Heat and inflammation',
          'Floating veins \u2014 An acute, mild illness',
          'Sunken veins \u2014 A chronic, more severe illness',
        ],
      },
      {
        heading: 'Degenerative Changes',
        body: 'Degenerative changes in the muscles of the hand indicate deficiencies:',
        listItems: [
          'Depression at 22.06 Zhong Bai / 22.07 Xia Bai \u2014 Spleen deficiency',
          'Depression at 22.08-09 Wan Shun Er/Yi \u2014 Kidney deficiency',
          'Degeneration at 22.05 Ling Gu to Zhong Kui (22) \u2014 weakness of Qi and Blood',
          'Stiff finger \u2014 Qi stagnation leading to Yin-fluid stagnation',
          'Folded, bent, or swollen finger \u2014 Chronic Yin stagnation',
        ],
      },
      {
        heading: 'Using VAS in Palm Diagnosis',
        body: 'Both Palm diagnosis and Auriculotherapy share many similarities: both are used for treatment and diagnosis, involve searching for blood vessels and skin color changes, and use body imaging techniques. The representations of the ear and hand in the homunculus of the cerebral cortex are large compared to other organs.\n\nScanning the hand with a Bahr 3V hammer can detect VAS in active diagnostic areas. In most patients, VAS is detected at Pc-8 Lao Gong (below the Heart diagnostic area) at varying intensities. VAS serves as a binary guide: if present, the area is active; if absent, it is not. Over time, working with VAS reveals important tissue changes that may have been previously overlooked.',
      },
      {
        heading: 'Diagnosis Through Zones 77 and 88',
        body: 'In addition to hand diagnosis, Zones 77 and 88 can be scanned to identify the root of the disease. These zones contain Dao Ma groups and bloodletting regions that can treat the Five Zang organs.\n\nWithin Zone 88, each of the Five Zang organs has a corresponding Dao Ma group. The external expression of the disease can often be found within these groups. In Zone 77, the Dao Ma groups and bloodletting regions are also associated with the Five Zang organs.\n\nThe external expression of the disease, diagnosis, and acupuncture points are interconnected. Luo channels found at diagnostic areas can be bled, and points where findings are detected can be needled.',
      },
      {
        heading: 'Diagnosing the Root Based on Symptoms',
        body: 'Chapter 74 of the Basic Questions describes symptomatic mechanisms for each of the Five Zang organs:',
        listItems: [
          'Liver \u2014 Any disease involving Wind causing involuntary movements and dizziness. Primary Dao Ma group: 88.12-14 Shang San Huang',
          'Kidneys \u2014 Any disease involving Coldness causing contraction and pulling (deficient Kidney Yang). Primary point: 77.18 Shen Guan; also 88.09-11 Tong Shen/Wei/Bei',
          'Spleen \u2014 Any disease involving Dampness causing bloating and fullness. Primary point: 77.05-07 San Zhong',
          'Heart \u2014 Any pain and disease involving itching and sores. Primary point: 22.10 Shou Jie (innervates Kidneys; Water controls Fire)',
          'Lungs \u2014 Every disease with dammed up Qi and stagnation. Primary Dao Ma group: 22.05 Ling Gu together with 22.04 Da Bai',
        ],
      },
    ],
  },
  {
    id: 'treatment-principles',
    number: 7,
    title: 'עקרונות טיפול ובחירת נקודות',
    titleEn: 'Treatment Principles and Point Selection',
    sections: [
      {
        body: 'When selecting points for treatment in Master Tung\'s acupuncture, it\'s crucial to apply a key treatment principle: treat the root first, then the tip. After diagnosing the patient, choose points that treat the mechanism of the disease (root) and symptoms (tip). The primary points should target the mechanism, while the secondary points should address the symptoms.\n\nSometimes, points may overlap in treating both the root and the tip. In other cases, the mechanism of the disease is not directly related to the patient\'s symptoms, requiring additional points to manage the symptoms. In acute and mild illnesses, treatment may focus solely on the symptoms.',
      },
      {
        heading: 'Root and Tip in Practice',
        body: 'Master Tung illustrates treatment principles based on the mechanism of the disease. He describes two types of sciatica: sciatica due to weak Kidneys and sciatica due to weak Lungs.\n\n22.05 Ling Gu and 22.04 Da Bai treat sciatica associated with weak Lungs, while 22.06 Zhong Bai addresses sciatica based on weak Kidneys. Through these examples, Master Tung emphasizes the importance of treating the mechanism, or root cause. There are five types of sciatica \u2014 Heart, Spleen, Lung, Kidney, and Liver \u2014 each associated with weakness in one of the Five Zang organs.',
      },
      {
        heading: 'Clinical Case: Dry Mouth',
        body: 'This case illustrates treating just the symptoms. Master Tung treated a patient with dry mouth, believing the condition was related to the secretory glands (Kidney channel). He needled 88.09 Tong Shen, a primary point for treating the Kidneys, known for its indications for dry mouth. He did not diagnose the root cause but directly treated the symptoms (Wang, 2013).',
      },
      {
        heading: 'Clinical Case: Difficulty Raising the Arm',
        body: 'Master Tung identified the root cause as Cold Wind invading the Lungs and needled 88.17-19 Sima (primary Lung points). He also added 88.09 Tong Shen (primary Kidney point). Why a Kidney point for a Lung condition? Two explanations:\n\nColdness is related to the Kidneys, external Wind to the Lungs. The Kidneys are the foundation of the body\'s Yang \u2014 to expel external Cold-Wind, Yang must be strengthened. Also, in Five Phase Theory, Water (Kidneys) is generated by Metal (Lungs), and this relationship can disperse Lung energy.\n\nAnother case involved a gaunt patient with difficulty raising his arm. Upon examining his palm, Master Tung observed a dark green stain along the Liver-Spleen channel. He needled 88.12-14 Shang San Huang (primary Liver points), focusing solely on treating the root cause without directly addressing the symptoms (Wang, 2013).',
      },
      {
        heading: 'Clinical Case: Fish Bone Stuck in the Throat',
        body: 'In acute cases, it is not always necessary to treat the mechanism. Master Tung treated a man who had suffered for two days from a fish bone stuck in his throat. He needled 77.05-07 San Zhong, key points influencing the throat. Immediately after acupuncture, the patient swallowed the bone. Here, Master Tung treated the throat directly rather than the mechanism of the disease (Wang, 2013).',
      },
      {
        heading: 'Primary Points for the Five Zang Organs',
        body: 'In severe, chronic diseases, it is important to needle the primary points according to the Five Zang organs. Zones 77 and 88 are the primary zones for treating chronic disorders:',
        listItems: [
          'Heart (Fire) \u2014 88.01-03 Zu San Tong',
          'Spleen/Pancreas (Earth) \u2014 77.08, 09, 11 Si Hua; Tu Chang (88); 77.05-07 San Zhong',
          'Lungs (Metal) \u2014 88.17-19 Sima',
          'Kidneys (Water) \u2014 77.17, 19, 21 Xia San Huang; 88.09-11 Tong Shen San Zhen; 77.18 Shen Guan',
          'Liver (Wood) \u2014 88.12-14 Shang San Huang',
        ],
      },
      {
        heading: 'The Supporting Sequence \u2014 Tonification',
        body: 'When tonification is needed, the mother point is needled. The mother of Metal is Earth, Water\'s mother is Metal, Wood\'s mother is Water, Fire\'s mother is Wood, Earth\'s mother is Fire.',
        listItems: [
          'Liver (Wood) \u2014 Needle Water-Kidneys (parent: 77.17, 19, 21 Xia San Huang) with Wood-Liver (child: 88.12-14 Shang San Huang)',
          'Heart (Fire) \u2014 Wood-Liver (parent: 88.12-14 Shang San Huang) nourishes Fire-Heart (child: 88.01-03 Tong Guan/Shan/Tian)',
          'Spleen (Earth) \u2014 Fire-Heart (parent: 88.01-03) tonifies Earth-Spleen; treats weakness in the four limbs',
          'Lungs (Metal) \u2014 Earth-Spleen (parent: 77.08, 09, 11 Si Hua) tonifies Metal-Lungs; treats Lung weakness, asthma, pneumonia',
          'Kidneys (Water) \u2014 Metal-Lungs (parent: 88.17-19 Sima) tonifies Water-Kidneys (child: 77.17, 19, 21 Xia San Huang)',
        ],
      },
      {
        heading: 'The Supporting Sequence \u2014 Dispersion',
        body: 'In certain excess conditions, the child can disperse the parent:',
        listItems: [
          'Blood stagnation \u2014 Spleen-Earth (child of Fire-Heart) can be used by bloodletting in the region of 77.08, 09, 11 Si Hua',
          'Excess Wood-Liver \u2014 Heart-Fire (child) through 88.01-03 Tong Guan/Shan/Tian treats dizziness and blurred vision',
        ],
      },
      {
        heading: 'The Restraining Sequence',
        body: 'The restraining sequence can control one of the Five Zang organs:',
        listItems: [
          '11.17 Mu \u2014 Treats hyperactive Liver Fire. Metal restrains Wood. Located on the second finger (Lungs-Metal), the name Mu represents Wood',
          '22.10 Shou Jie \u2014 Treats pain and itching (connected to Heart). Located in the Kidney-Water area. Water restrains Fire',
        ],
      },
      {
        heading: 'Choosing Points According to the Pathogen',
        body: 'The primary points of the Zang organs based on the type of pathogen:',
        listItems: [
          'External Wind \u2192 Lungs',
          'Dampness \u2192 Spleen',
          'Coldness \u2192 Kidneys',
          'Internal Wind \u2192 Liver',
          'Heat and Fire \u2192 Heart',
        ],
      },
    ],
  },
  {
    id: 'needling-techniques',
    number: 8,
    title: 'טכניקות דיקור והחזקת מחטים',
    titleEn: 'Needling Techniques and Needle Retention',
    sections: [
      {
        heading: 'Master Tung\'s Needling Approach',
        body: 'Master Tung\'s needling technique is simple. He didn\'t use dispersion and tonification techniques; instead, he would insert the needle to the desired depth and achieve De Qi.\n\nIn Chapter 77 of Lao Zi\'s Tao Te Ching: "The Tao of Heaven is like drawing a bow / Lower that which is high / Raise that which is low / Reduce that which has excess / Add to that which is lacking."\n\nAcupuncture follows a similar principle, striving for balance: reducing in excess and adding in deficiency. The needle seeks to balance the body without the need for additional tonification and dispersion techniques.\n\nThe Tao of people is similar to moxibustion and bloodletting: moxibustion tonifies, while bloodletting disperses.',
      },
      {
        heading: 'Needling on the Opposite Side',
        body: 'Master Tung often needled the side opposite to the disease. This technique is known as Miu Ci [缪刺]. Chapter 5 of the Basic Questions states: "With the right they treat the left and with the left they treat the right."\n\nChuan Min Wang explains that Tung\'s method is based on the Luoshu [洛書] Square, which represents space and time. In the Luoshu Square, opposite pairs always sum to 10 (1+9, 3+7, 4+6, 2+8), representing wholeness.\n\nThe human body can be mapped onto the Luoshu Square: 9 = head, 1 = lower trunk, 3 = left trunk, 7 = right trunk, 4 = left hand, 2 = right hand, 8 = left leg, 6 = right leg.',
        listItems: [
          'Pain in the right shoulder \u2192 needle the left leg',
          'Pain in the left hand \u2192 needle the right leg',
          'Pain on the right side of the head \u2192 needle the left side of the leg',
          'Pain on the right side of the lower abdomen \u2192 needle the left side of the hand',
          'Pain on the left side of the chest \u2192 needle the right leg',
        ],
      },
      {
        heading: 'Disorders of the Zang Organs',
        body: 'Disorders of the internal organs require a different approach. Zones 77 and 88 are typically needled on the same side as the affected organ, while the hands are needled on the opposite side.',
        listItems: [
          'Liver (right side) \u2014 33.11 Gan Men on the left hand + 88.12-14 Shang San Huang on the right thigh',
          'Spleen (left side) \u2014 11.18 Pi Zhong on the right hand + 77.05-07 San Zhong on the left leg',
          'Kidneys and Lungs (both sides) \u2014 needle both sides unless disease is known to be on one side',
          'Heart, Stomach, Intestines (central) \u2014 needle both sides',
        ],
      },
      {
        body: 'When treating disorders of the limbs and internal organs, the external expression of the disease takes precedence over these guidelines. Needling is always performed in the area of the external expression of the disease, even if it contradicts the rules. For example, in pneumonia of the right lung, the rules suggest needling the left hand and right leg. However, if the disease manifests on the right hand, the right side should be needled.',
      },
      {
        heading: 'Needling Depths and Angles',
        body: 'Master Tung specifies various needle depths with distinct therapeutic effects. For instance, under 11.01 Da Jian: inserting to 0.1 cun treats Heart diseases, while 0.2-0.3 cun addresses diseases of the Small and Large Intestines. Under 77.08 Si Hua Shang: 2 cun depth treats asthma, 3 cun treats Heart diseases.',
      },
      {
        heading: 'The Three Heaters on Two Planes',
        body: 'Similar to Dao Ma groups, the needle depth can be divided according to the Three Heaters: the surface depth corresponds to the Upper Heater, the middle depth to the Middle Heater, and the deepest depth to the Lower Heater.\n\nIn Tung\'s acupuncture, the Three Heaters are manifested on two planes: (1) the division into Three Heaters within the Dao Ma groups, and (2) needle depth, also divided into Three Heaters.\n\nThe angle of needle insertion is also significant. For example, 22.05 Ling Gu is needled toward 22.09 Wan Shun Er for lower back disorders and toward 22.02 Chong Xian for chest and Lungs.',
      },
      {
        heading: 'Using VAS to Determine Needling Depth',
        body: 'VAS can be used to determine the appropriate needling depth. After inserting the needle, holding the end of the needle while taking the patient\'s pulse can generate VAS in active points.\n\nBy adjusting the needle depth, the practitioner can use the needle to cancel the VAS response. After inserting the needle, the practitioner takes the pulse while varying the needle\'s depth to find the depth that cancels the VAS \u2014 restoring balance to the body.',
      },
      {
        heading: 'Moving Qi Needling Technique (Dong Qi Zhen Fa)',
        body: 'Dong Qi Zhen Fa [動氣针法] \u2014 after inserting the needle and manipulating it, Master Tung would ask patients to move the affected area to check for improvement. Since one point can treat multiple conditions, Dong Qi allows the Qi to be directed to the affected area.\n\nIf the disease is in the chest or abdomen, the patient may be asked to breathe deeply, or the area might be massaged while the patient focuses on it. This technique establishes a connection between the needle and the location of the disease.\n\nIntention plays a vital role in healing. Sun Simiao [孫思邈], who received the title "China\'s King of Medicine," wrote: "Medicine is intention. Those who are proficient at using intention are good doctors."',
      },
      {
        heading: 'Needle Retention',
        body: 'In Master Tung\'s acupuncture, needles are generally retained for 40 minutes to an hour, and sometimes even longer. This contrasts with the common Western practice of 15 to 30 minutes.\n\nThe belief that extended retention exhausts Qi is based on a misinterpretation of Chapter 12 of Ling Shu (which mentions ten breaths). Leo Lok found evidence in ancient scripts supporting longer retention: 20 breaths, 35 breaths, and even 40 to 120 breaths.\n\nA remarkable phenomenon during treatment is when patients enter a deep meditative state ("acupuncture sleep"), often occurring after 20-30 minutes. In orthopedic cases, improvement was often seen only after 40 minutes.\n\nWhen determining retention time, observe the patient: if in a meditative state, keep needles in place; if restless, remove them.',
      },
    ],
  },
  {
    id: 'bloodletting',
    number: 9,
    title: 'הקזת דם בדיקור מאסטר דונג',
    titleEn: 'Bloodletting in Master Tung\'s Acupuncture',
    sections: [
      {
        body: 'Bloodletting is a central technique used in Master Tung\'s acupuncture. It reduces the number of treatments needed and improves the results. Master Tung often said:\n\n"In long-term diseases, there must be blood stagnation; in rare diseases, there must be blood stagnation; in painful diseases, there must be blood stagnation; in severe diseases, there must be blood stagnation."\n\nHe believed that Blood stagnation necessarily plays a role in chronic, rare, painful, and severe diseases. Practitioners look for signs of Blood stagnation on the surface of the body \u2014 another aspect of the external expression of the disease.',
      },
      {
        heading: 'Identifying Bloodletting Regions',
        body: 'Bloodletting regions are identified through palpation and visual examination:',
        listItems: [
          'Palpation \u2014 reveals tissue hardening and the presence of nodules',
          'Visual examination \u2014 seeks Luo channels: dark or red blood vessels on the skin\'s surface (1-3 cm long), or spider angiomas (black-purple or red accumulations beneath the skin)',
          'Skin stains are also considered Luo channels',
        ],
      },
      {
        heading: 'Bloodletting Needles',
        body: 'Master Tung originally used a sharp-edged needle, Feng Zhen [\u92d2\u91dd]. Today, hypodermic needles (hollow needles, G21-G18 diameter) are more commonly used.',
      },
      {
        heading: 'Three Categories of Bloodletting',
        body: 'Bloodletting treatments can be divided into three categories:',
        listItems: [
          'Bloodletting Master Tung\'s points \u2014 pinching the point, performing bloodletting, and squeezing out a few drops of blood',
          'Bloodletting regions \u2014 specific areas in Zones 66 and 77 (foot and lower leg)',
          'Local bloodletting \u2014 bleeding the affected area directly',
        ],
      },
      {
        heading: 'Bloodletting Points (VT and DT Zones)',
        body: 'Some points can be needled or bled, while others (particularly on the neck and trunk) are only bled. Master Tung said: "The points of the upper back treat diseases of the four limbs and Bladder channel, while the points of the lower back treat gynecological diseases. Both areas are treated by bloodletting."\n\nThe main use of VT and DT zones is for treating internal organ disorders. The DT points are similar to Shu points (on the back), and VT points are similar to alarm points (on the front). Due to the superficial nature of bloodletting, Master Tung bled these points instead of needling them to avoid harming internal organs.\n\nClinical practice requires examining the area for Luo channels or tissue color changes, following Huo Wen Zhi\'s rule: "Non-existing points without a location are superior to existing points with a location."',
      },
      {
        heading: 'Bloodletting Region 1 \u2014 Anterior Lower Leg',
        body: 'The anterior aspect of the lower leg and dorsal aspect of the foot.',
        listItems: [
          'Heart \u2014 Between the knee and 2 cun above the ankle. Treats: heart weakness, chest oppression, palpitations, arrhythmia, dyspnea, hypercholesterolemia, blood stagnation, lung diseases, eye diseases',
          'Liver \u2014 2 cun inferior to the knee. Treats: pain above the eye, hypochondrium/rib pain due to Liver Qi stagnation',
          'Stomach \u2014 Between Heart region and frontal head region. Treats: stomach pain/distention, gastric ulcers, duodenal ulcer, esophageal disorders, digestive disorders',
          'Frontal Head \u2014 Dorsal aspect of the foot. Treats: frontal/vertex headache, dizziness, hypertension, neurasthenia, forgetfulness, dementia',
        ],
      },
      {
        heading: 'Bloodletting Region 2 \u2014 Lateral Lower Leg',
        body: 'The lateral aspect of the leg.',
        listItems: [
          'Mouth and Teeth \u2014 From knee crease to below 77.08 Si Hua Shang. Treats: oral cavity diseases, lip/teeth/gum disorders, oral ulcers, herpes labialis, toothache',
          'Lungs \u2014 Inferior to mouth/teeth area, up to 3 cun above lateral malleolus. Treats: chest pain, pneumonia, asthma, bronchitis, emphysema, shoulder pain, endocarditis, arrhythmia',
          'Ears \u2014 3 cun superior to lateral ankle. Treats: ear pain, otitis (externa/media), labyrinthitis, deafness',
          'Temporal Head \u2014 Above lateral ankle. Treats: migraine, temple headache, TMJ, dizziness, hypertension',
          'Chest \u2014 Region of 77.26 Qi Hu. Treats: shoulder/clavicle pain, rib pain, ankle sprain',
        ],
      },
      {
        heading: 'Bloodletting Region 3 \u2014 Medial Lower Leg',
        body: 'The medial aspect of the leg.',
        listItems: [
          'Kidneys and Bladder \u2014 From knee crease to medial malleolus. Treats: lower abdomen pain, female/male reproductive disorders, uterine conditions, menstrual disorders, UTI, cystitis, erectile dysfunction',
          'Medial Temporal Head \u2014 Below medial ankle. Treats: migraine, TMJ, dizziness, hypertension',
        ],
      },
      {
        heading: 'Bloodletting Region 4 \u2014 Posterior Lower Leg',
        body: 'The posterior side of the leg, 4 cun above and below the crease of the knee (Occipital Region).',
        listItems: [
          'Treats: occipital headache, stiff neck, lower back pain, sciatica',
          'Spondylosis, herniated disc, enteritis',
          'Hypertension, stroke, hemiplegia',
          'Hemorrhoids, dysuria, rheumatism of the lower limbs',
        ],
      },
      {
        heading: 'Local Bloodletting',
        body: 'For disorders of the four limbs, the affected area is bled directly. For internal organs, bleed the corresponding region on the back or front of the body:',
        listItems: [
          'Lung diseases \u2192 VT.03 Jin Wu and VT.02 Shier Hou',
          'Stomach diseases \u2192 VT.04 Wei Mao Qi',
          'Kidney and Intestine diseases \u2192 VT.05 Fu Chao Ershisan',
        ],
      },
      {
        heading: 'Bloodletting Regions on the Back',
        body: 'Five bloodletting regions for internal organs on the back, identified relative to spinous processes:',
        listItems: [
          'Lung and Heart Region (T2-T5) \u2014 Common cold, fever, chest pain, bronchitis, pneumonia, asthma, coronary heart disease, upper back/scapula pain',
          'Liver Region (T6-T10) \u2014 Hepatitis, liver cirrhosis, cholecystitis, gallstones, splenomegaly, rib pain, middle back pain',
          'Spleen and Stomach Region (T11-L1) \u2014 Digestive difficulties, flatulence, bloating, gastric/duodenal ulcers, vomiting, diarrhea, back pain',
          'Kidney Region (L2-L5) \u2014 Nephritis, cystitis, edema, uterine/ovarian inflammation, lower back pain, sciatica',
          'Sacrum (Sacrum-Coccyx) \u2014 Sacrum/buttock/coccyx pain, SI joint pain, irregular menstruation, enlarged prostate, occipital headache',
        ],
      },
    ],
  },
  {
    id: '72-absolute-32-relieving',
    number: 10,
    title: '72 נקודות מוחלטות ו-32 נקודות הקלה',
    titleEn: "Tung's 72 Absolute Points and the 32 Relieving Points",
    sections: [
      {
        body: 'Master Tung has two lists of points that are considered secret, although the lists can be found online. The first list has 72 points, and the second has 32 points. In both lists, we find the best points for treating various pathologies.',
      },
      {
        heading: "Tung's 72 Severing (Absolute) Points — 董氏七十二绝针",
        body: 'The 72 Tung Absolute Needles [董氏七十二绝针] Dong shi qishier jue zhen. The character [絕] Jue means cut off, extinct, disappear, completely. The points in the list are very effective because they can interrupt or completely eliminate the medical condition and the patient\'s suffering. For example, 44.09 Di zhong can treat fainting (yang collapse).',
      },
      {
        heading: 'The List of 72 Absolute Points',
        body: 'The following points comprise the 72 Absolute Needles:',
        listItems: [
          'Feng chao (11) — three points',
          'Shuang ling (11) — two points',
          'Mu ling (11) point',
          '11.24 Fu ke five points',
          '11.10 Mu huo four points',
          'Ba guan si (11) point',
          'Ba guan san (11) point',
          '22.06 Zhong bai (22) point',
          '22.08-09 Wan shun yi/er two points',
          'Shang/xia go (22) two points',
          'Mu guan (22) point',
          'Gu guan (22) point',
          'San cha (22) three points',
          '22.05 Ling gu point',
          'Xin ling (33) three points',
          'Gan ling (33) three points',
          'Shen jian (44) point',
          'San ling (44) three points',
          'San zheng ji (44) three points',
          '44.09 Di zong point',
          '44.06 Jian zhong point',
          'San shen (44) three points',
          '66.02 Mu fu (55) point',
          'San sheng (66) three points',
          '77.27 Wai san guan three points',
          'Shuang long (77) two points',
          'Jin yin (88) two points',
          'Mu huang (88) point',
          'Tu ling (88) point',
          'Huo fu 火府 (88) point',
          'Huo liang 火梁 (88) point',
          'Mu fu 木府 (88) point',
          'Mu liang 木梁 (88) point',
          'Mu chang 木昌 (88) point',
          'San ling (88) three points',
          'Shen er san (99) three points',
          'Wai er 外耳 (99) point',
        ],
      },
      {
        heading: 'The 32 Relieving Points — 董氏三十二解针',
        body: '32 Relieving Points [董氏三十二解针] Dong shi sanshier jie zhen. The meaning of the character [解] Jie is to divide, separate, melt, exempt, eliminate, unite, release, open, explain. The 32 points are used for acute situations involving toxicity from an external source, such as food, medicine, drugs, alcohol, and bites. They are also used in situations of dizziness, fainting, and pain. For example, 22.08 Shou Jie treats needle shock, pain, and constriction after acupuncture and sharp pain following a contusion. Master Tung did not reveal the full list, only 18 points.',
      },
      {
        heading: 'The List of Relieving Points',
        body: 'The following are the known relieving points:',
        listItems: [
          '22.10 Shou jie two points',
          'Mu/gu guan (22) two points',
          '33.08-09 Shou wu/qian jin two points',
          '44.09 Di zong point',
          '88.28 Jie point',
          'Jin yin (88) two points',
          'Tian er 天耳 (99) point',
          '1010.05 Qian hui point',
          'DT.01-02 Fen zhi two points',
          'Shen er san (99) three points',
          'Fan zhi zhong (DT) point',
        ],
      },
    ],
  },
]
