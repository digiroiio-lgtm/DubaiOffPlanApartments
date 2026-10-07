import type { Guide } from './types';

const DLD = { label: 'Dubai Land Department', url: 'https://dubailand.gov.ae/' };

export const guides: Guide[] = [
  {
    slug: 'off-plan-buying-process',
    title: 'How buying off-plan in Dubai works',
    description: 'The main steps from shortlisting a project to handover and title deed, and what to check at each stage.',
    sections: [
      {
        heading: '1. Shortlist and check the project',
        body: [
          'Start from your total budget and the cash you can pay up front. Then compare projects on payment schedule, expected handover and location, not only on starting price.',
          'Check that the project and developer are registered with the Dubai Land Department (DLD) before paying anything.',
        ],
      },
      {
        heading: '2. Reserve the unit',
        body: [
          'Developers usually ask for a booking payment to reserve a unit. Ask in writing what happens to this payment if you do not proceed, and pay only to the account stated by the developer.',
        ],
      },
      {
        heading: '3. Sign the sale and purchase agreement (SPA)',
        body: [
          'The SPA sets out the unit, price, payment schedule, expected completion date and what happens in case of delay. Read it fully, and take independent legal advice if anything is unclear.',
        ],
      },
      {
        heading: '4. Registration (Oqood)',
        body: [
          'Off-plan sales are registered with the DLD in the interim register, commonly known as Oqood. Registration fees apply; confirm the current amount with the DLD or the developer.',
        ],
      },
      {
        heading: '5. Pay instalments into escrow',
        body: [
          'Instalments for registered off-plan projects are paid into the project escrow account. Keep every receipt and check that the account details match the SPA.',
        ],
      },
      {
        heading: '6. Handover and title deed',
        body: [
          'Before handover, inspect the unit (snagging) and pay any remaining amount due on handover. After completion the title deed is issued in your name.',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
  {
    slug: 'total-purchase-costs',
    title: 'Total cost of buying an off-plan apartment',
    description: 'The price is only part of the cost. Plan for registration fees, service charges and financing costs.',
    sections: [
      {
        heading: 'Dubai Land Department fees',
        body: [
          'The DLD charges a registration (transfer) fee on property purchases, commonly 4% of the purchase price, plus administrative fees. Developers sometimes run offers that cover part of these fees; ask for the offer in writing.',
          'Fees change from time to time. Always confirm current amounts with the DLD before budgeting.',
        ],
      },
      {
        heading: 'Service charges',
        body: [
          'After handover, owners pay annual service charges for building maintenance and common areas. Ask for the expected rate per square foot and check approved budgets for comparable buildings.',
        ],
      },
      {
        heading: 'Financing costs',
        body: [
          'If you plan to use a mortgage for the handover payment, include bank arrangement fees, valuation fees, mortgage registration fees and insurance. Check eligibility early, as lenders set their own rules for off-plan properties.',
        ],
      },
      {
        heading: 'Other costs to plan for',
        body: [
          'Furnishing, utility connection deposits and, if you will rent the unit out, management fees. Agency fees depend on the transaction; ask who pays them before you commit.',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
  {
    slug: 'understanding-payment-plans',
    title: 'Understanding off-plan payment plans',
    description: 'How construction-linked and post-handover plans work, and how to compare them.',
    sections: [
      {
        heading: 'How a plan is written',
        body: [
          'Plans are usually written as percentages, for example 20/40/40: 20% on booking, 40% during construction and 40% on handover. The exact dates or construction milestones are set out in the SPA.',
        ],
      },
      {
        heading: 'Construction-linked plans',
        body: [
          'Instalments are tied to dates or construction progress. You usually pay the remaining balance at handover, either in cash or with a mortgage.',
        ],
      },
      {
        heading: 'Post-handover plans',
        body: [
          'Part of the price is paid after you receive the keys, often over a set number of months. These plans lower the amount needed at handover but can come with a higher overall price.',
        ],
      },
      {
        heading: 'How to compare plans',
        body: [
          'Map every payment against your expected cash flow. Ask what happens if construction runs ahead of or behind schedule, and whether any discount is available for paying earlier.',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
  {
    slug: 'developer-and-project-checks',
    title: 'Checking a developer and project before you buy',
    description: 'Practical checks to run before paying a booking amount on an off-plan project.',
    sections: [
      {
        heading: 'Registration',
        body: [
          'Confirm that the developer and the project are registered with the Dubai Land Department and the Real Estate Regulatory Agency (RERA). Official DLD channels let you look up project status.',
        ],
      },
      {
        heading: 'Escrow account',
        body: [
          'Registered off-plan projects must have an escrow account. Payments should go to that account, not to an individual or an unrelated company.',
        ],
      },
      {
        heading: 'Track record',
        body: [
          'Look at the developer’s completed buildings: visit one if you can, and compare promised and actual handover dates.',
        ],
      },
      {
        heading: 'Contract terms',
        body: [
          'Read the SPA clauses on delay, specification changes, unit area tolerance and cancellation. Get independent legal advice for anything you do not understand.',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
  {
    slug: 'off-plan-vs-ready',
    title: 'Off-plan vs ready apartments',
    description: 'The trade-offs between buying before completion and buying a finished apartment.',
    sections: [
      {
        heading: 'Off-plan',
        body: [
          'Payments are spread over the construction period and you choose from a new building’s full unit mix. In exchange you wait for completion, and the handover date and final finish can change.',
        ],
      },
      {
        heading: 'Ready',
        body: [
          'You see exactly what you buy and can move in or rent it out straight away. Most of the price is usually due at transfer, either in cash or with a mortgage.',
        ],
      },
      {
        heading: 'Which suits you?',
        body: [
          'If you need the apartment soon or want rental income now, ready property is usually simpler. If you can wait and prefer staged payments, off-plan may fit better. Base the decision on your timeline and cash flow.',
        ],
      },
    ],
    sources: [DLD],
    updated: '2026-10-07',
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
