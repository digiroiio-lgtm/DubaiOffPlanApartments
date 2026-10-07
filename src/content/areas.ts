import type { Area } from './types';

const DLD = { label: 'Dubai Land Department', url: 'https://dubailand.gov.ae/' };
const RTA = { label: 'Roads and Transport Authority (RTA)', url: 'https://www.rta.ae/' };

export const areas: Area[] = [
  {
    slug: 'jvc',
    name: 'Jumeirah Village Circle',
    shortName: 'JVC',
    tagline: 'Community living',
    image: '/images/area-jvc.webp',
    imageAlt: 'Representative image of landscaped mid-rise residential streets',
    intro:
      'Jumeirah Village Circle (JVC) is a master-planned residential community by Nakheel, laid out in a circular plan of districts with apartment buildings, townhouses and villas.',
    sections: [
      {
        heading: 'Location and access',
        body: [
          'JVC sits inland between Al Khail Road (E44) and Sheikh Mohammed Bin Zayed Road (E311), close to Al Barsha South and Dubai Sports City.',
          'Most residents rely on cars, taxis and buses. Check the RTA journey planner for current public transport routes before you buy.',
        ],
      },
      {
        heading: 'What buyers usually look at',
        body: [
          'Many off-plan launches in JVC are mid-rise buildings with studios and one- and two-bedroom apartments, which keeps entry budgets lower than in central districts.',
          'Because many buildings are delivered by different developers, compare build quality, service charges and the developer track record project by project.',
        ],
      },
      {
        heading: 'Questions to ask',
        body: [
          'Which district and street is the building on, and what is planned around it?',
          'What are the expected service charges per square foot, and who manages the building?',
        ],
      },
    ],
    sources: [{ label: 'Nakheel (master developer)', url: 'https://www.nakheel.com/' }, DLD, RTA],
    updated: '2026-10-07',
  },
  {
    slug: 'business-bay',
    name: 'Business Bay',
    shortName: 'Business Bay',
    tagline: 'City and canal views',
    image: '/images/area-business-bay.webp',
    imageAlt: 'Representative image of high-rise towers along a canal at sunset',
    intro:
      'Business Bay is a central district next to Downtown Dubai, built along the Dubai Water Canal, with a mix of office towers, hotels and residential buildings.',
    sections: [
      {
        heading: 'Location and access',
        body: [
          'The district runs between Sheikh Zayed Road, Al Khail Road and Downtown Dubai, with the Dubai Water Canal passing through it.',
          'Business Bay Metro Station on the Red Line serves the Sheikh Zayed Road side of the district.',
        ],
      },
      {
        heading: 'What buyers usually look at',
        body: [
          'Apartments tend to be in high-rise towers. View (canal, Downtown skyline or neighbouring towers) and floor level can make a large difference to pricing between units in the same building.',
          'Compare payment plans carefully: central projects often ask for a larger share during construction.',
        ],
      },
      {
        heading: 'Questions to ask',
        body: [
          'Which views are protected and which could be blocked by future towers?',
          'How is parking allocated, and what are the expected service charges?',
        ],
      },
    ],
    sources: [DLD, RTA],
    updated: '2026-10-07',
  },
  {
    slug: 'dubai-south',
    name: 'Dubai South',
    shortName: 'Dubai South',
    tagline: 'New neighbourhoods',
    image: '/images/area-dubai-south.webp',
    imageAlt: 'Representative image of a new low-rise neighbourhood with palm-lined walkways',
    intro:
      'Dubai South is a master-planned city in the south of Dubai built around Al Maktoum International Airport (DWC) and close to Expo City Dubai.',
    sections: [
      {
        heading: 'Location and access',
        body: [
          'The area lies in the Jebel Ali district near Sheikh Mohammed Bin Zayed Road (E311) and Emirates Road (E611).',
          'Distances to central Dubai are longer than from established districts, so commuting time is an important part of the decision.',
        ],
      },
      {
        heading: 'What buyers usually look at',
        body: [
          'Dubai South includes several newer residential neighbourhoods, often with lower entry prices and longer payment plans than central areas.',
          'Many surrounding amenities are still being delivered. Check which schools, retail and transport links already operate and which are only planned.',
        ],
      },
      {
        heading: 'Questions to ask',
        body: [
          'Which phase of the master plan is the project in, and what is already completed around it?',
          'What is the expected handover date, and what happens under the contract if it is delayed?',
        ],
      },
    ],
    sources: [{ label: 'Dubai South (master developer)', url: 'https://www.dubaisouth.ae/' }, DLD],
    updated: '2026-10-07',
  },
  {
    slug: 'dubai-creek-harbour',
    name: 'Dubai Creek Harbour',
    shortName: 'Dubai Creek Harbour',
    tagline: 'Waterfront towers',
    image: null,
    imageAlt: '',
    intro:
      'Dubai Creek Harbour is a waterfront development by Emaar on the Dubai Creek, next to the Ras Al Khor Wildlife Sanctuary.',
    sections: [
      {
        heading: 'Location and access',
        body: [
          'The community sits on the east bank of Dubai Creek with road access via Ras Al Khor Road and Al Khail Road.',
          'Check the RTA journey planner for current public transport routes; planned links should not be treated as operating services.',
        ],
      },
      {
        heading: 'What buyers usually look at',
        body: [
          'Most projects are residential towers with views over the creek, the wildlife sanctuary or the Downtown skyline.',
          'Payment plans are usually set by the master developer for each launch, so compare launches individually.',
        ],
      },
      {
        heading: 'Questions to ask',
        body: [
          'Which phase is the building in, and which amenities in that phase are already open?',
          'What are the expected service charges for the tower?',
        ],
      },
    ],
    sources: [{ label: 'Emaar Properties (master developer)', url: 'https://www.emaar.com/' }, DLD, RTA],
    updated: '2026-10-07',
  },
  {
    slug: 'dubai-maritime-city',
    name: 'Dubai Maritime City',
    shortName: 'Dubai Maritime City',
    tagline: 'Sea-facing peninsula',
    image: null,
    imageAlt: '',
    intro:
      'Dubai Maritime City is a man-made peninsula between Port Rashid (Mina Rashid) and Dubai Drydocks, planned as a maritime business and residential district.',
    sections: [
      {
        heading: 'Location and access',
        body: [
          'The peninsula sits on the coast near Al Mina and Bur Dubai, a short drive from Downtown Dubai and the older parts of the city.',
          'The district is still developing, so check the current status of roads, retail and services around each plot.',
        ],
      },
      {
        heading: 'What buyers usually look at',
        body: [
          'Projects are typically residential towers with sea or skyline views. Several developers are active, so track records vary.',
          'Because the area is still being built out, confirm what is already operating versus what is planned.',
        ],
      },
      {
        heading: 'Questions to ask',
        body: [
          'Is the developer registered for this project with the Dubai Land Department, and is there a project escrow account?',
          'What is planned on neighbouring plots that could affect views or access?',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
