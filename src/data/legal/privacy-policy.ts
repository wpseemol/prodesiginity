import type { LegalDocument } from "./types";

/**
 * data/legal/privacy-policy.ts
 * ---------------------------------------------------------------------------
 * EDITING GUIDE
 *  - Change text → edit the strings below. Nothing else needs to change.
 *  - Add a section → append to `sections`. The table of contents, anchors and
 *    llms.txt pick it up automatically.
 *  - After any material change: bump `version` and set `lastUpdated`.
 *  - {{tokens}} resolve from config/site.ts.
 *
 * This is a well-structured starting template, not legal advice. Have a
 * qualified lawyer review it before launch — especially the sub-processor
 * table, the retention period and the GDPR/CCPA sections, which depend on
 * tools and contracts only you can confirm.
 */
export const privacyPolicy: LegalDocument = {
    slug: "privacy-policy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    description:
        "How {{brand}} collects, uses, shares and protects personal data and client project files across our 3D product visualization and packaging design services.",
    effectiveDate: "2026-08-23",
    lastUpdated: "2026-08-23",
    version: "1.0",

    intro: [
        "{{brand}} (“we”, “us”, “our”) is a 3D product visualization and packaging design studio operating at {{domain}}. This policy explains what personal data we collect when you browse our site, send an enquiry, or work with us on a project, and what we do with it.",
        "We keep this deliberately plain. If anything here is unclear, email {{privacyEmail}} and we will answer in writing.",
    ],

    sections: [
        {
            id: "who-we-are",
            title: "Who we are and who this policy covers",
            summary:
                "{{brand}} is the data controller for personal data collected through {{domain}} and through direct client communication.",
            blocks: [
                {
                    type: "paragraph",
                    text: "This policy applies to visitors to {{domain}}, people who contact us about a project, and clients who engage us for 3D product rendering, packaging design, product CGI, product animation, or Amazon and Shopify listing visuals.",
                },
                {
                    type: "paragraph",
                    text: "It does not cover third-party websites we link to, or the platforms our clients publish finished work on (for example Amazon, Shopify or Meta), which run under their own privacy policies.",
                },
                {
                    type: "definitions",
                    items: [
                        {
                            term: "Controller",
                            description:
                                "{{legalName}}, {{addressLine}}. Contact: {{privacyEmail}}.",
                        },
                        {
                            term: "Personal data",
                            description:
                                "Any information that identifies you directly or indirectly — for example your name, email address, company, or IP address.",
                        },
                        {
                            term: "Client materials",
                            description:
                                "Files you send us to complete a project: product photos, CAD and STEP files, dielines, brand guidelines, artwork and copy.",
                        },
                    ],
                },
            ],
        },
        {
            id: "data-we-collect",
            title: "Data we collect",
            summary:
                "We collect only what a project needs: contact details you submit, the files you send us, and basic anonymous analytics about site usage.",
            blocks: [
                {
                    type: "paragraph",
                    text: "We do not buy contact lists, and we do not ask for payment card numbers on our website.",
                },
                {
                    type: "table",
                    caption: "What we collect and why",
                    head: ["Category", "Examples", "Source"],
                    rows: [
                        [
                            "Enquiry details",
                            "Name, email, company, budget range, project brief",
                            "Our contact form, email or WhatsApp",
                        ],
                        [
                            "Client project data",
                            "Product photos, CAD/STEP/OBJ/STL files, dielines, brand assets, feedback notes",
                            "Sent by you during a project",
                        ],
                        [
                            "Billing details",
                            "Invoice name, billing address, VAT/tax ID, transaction reference",
                            "Provided by you; card data is handled by the payment provider, never by us",
                        ],
                        [
                            "Technical data",
                            "IP address, browser type, device type, referring page",
                            "Collected automatically by our hosting provider",
                        ],
                        [
                            "Usage data",
                            "Pages viewed, time on page, aggregate traffic sources",
                            "Privacy-friendly analytics, in aggregate",
                        ],
                    ],
                },
                {
                    type: "callout",
                    tone: "info",
                    title: "Sensitive data",
                    text: "We do not intentionally collect special-category data such as health, biometric, religious or political information. Please do not include it in a project brief.",
                },
            ],
        },
        {
            id: "how-we-use-data",
            title: "How we use your data",
            summary:
                "We use personal data to quote, deliver and support projects, to invoice, and to keep the site secure — not to profile you or sell access to you.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Respond to enquiries and prepare quotes, scopes and timelines.",
                        "Deliver contracted work: 3D modeling, rendering, packaging design, CGI, animation and listing visuals.",
                        "Send project updates, review links, revision requests and final files.",
                        "Issue invoices, collect payment and keep accounting records.",
                        "Protect the site against abuse, spam and fraud.",
                        "Improve our services using aggregated, non-identifying usage patterns.",
                        "Send occasional service updates, only where you have asked for them or where we have a prior business relationship. Every such email has an unsubscribe link.",
                    ],
                },
                {
                    type: "callout",
                    tone: "warning",
                    title: "We never sell your data",
                    text: "We do not sell, rent or trade personal data, and we do not share client project files with advertisers, data brokers or lead-generation services.",
                },
            ],
        },
        {
            id: "legal-bases",
            title: "Legal bases for processing (UK & EU)",
            summary:
                "If you are in the UK or EU, we rely on contract, legitimate interests, legal obligation or consent, depending on the purpose.",
            blocks: [
                {
                    type: "definitions",
                    items: [
                        {
                            term: "Contract",
                            description:
                                "Processing needed to quote for, deliver and support a project you have engaged us for.",
                        },
                        {
                            term: "Legitimate interests",
                            description:
                                "Running and securing our website, keeping business records, and replying to enquiries from prospective clients — balanced against your rights.",
                        },
                        {
                            term: "Legal obligation",
                            description:
                                "Retaining invoices and tax records for the period required by law.",
                        },
                        {
                            term: "Consent",
                            description:
                                "Optional marketing emails and any non-essential cookies. You can withdraw consent at any time.",
                        },
                    ],
                },
            ],
        },
        {
            id: "client-files",
            title: "Client files, confidentiality and unreleased products",
            summary:
                "Client materials are treated as confidential by default; unreleased products are never shown publicly without written permission.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Much of what we receive is commercially sensitive — an unreleased fragrance bottle, a packaging dieline, or a product not yet listed. We treat all client materials as confidential whether or not a separate NDA is in place, and we are happy to sign yours.",
                },
                {
                    type: "list",
                    items: [
                        "Access to project files is limited to the team members working on that project.",
                        "We do not publish work in progress, and we do not add finished work to our portfolio without your written approval.",
                        "If you request a portfolio embargo or permanent exclusion, we honour it — see the Terms of Service for the portfolio licence.",
                        "Working files are removed from active storage after {{legal.dataRetentionMonths}} months unless you ask us to keep them for future revisions.",
                    ],
                },
            ],
        },
        {
            id: "ai-tools",
            title: "Our use of AI tools",
            summary:
                "We do not upload confidential client materials into public generative-AI tools, and we do not allow client data to be used to train third-party models.",
            blocks: [
                {
                    type: "paragraph",
                    text: "AI-assisted tools are part of a modern production pipeline. We use them in ways that keep your material private:",
                },
                {
                    type: "list",
                    items: [
                        "Confidential client files — CAD data, dielines, unreleased artwork and NDA-covered products — are not submitted to public or consumer AI services.",
                        "Where we use AI-assisted software in production, we use business or enterprise tiers configured so that inputs are not retained for model training.",
                        "Final deliverables are produced and quality-checked by our team; we tell you if any part of a deliverable was generated rather than modeled, when that distinction matters to you.",
                        "We do not use client data to train any model of our own.",
                    ],
                },
                {
                    type: "callout",
                    tone: "info",
                    title: "Ask us for specifics",
                    text: "If your procurement or legal team needs a written statement of which tools touch your data, email {{privacyEmail}} and we will provide one.",
                },
            ],
        },
        {
            id: "sharing",
            title: "Who we share data with",
            summary:
                "We share data only with the service providers needed to run the studio, each under a data processing agreement.",
            blocks: [
                {
                    type: "table",
                    caption: "Categories of sub-processor",
                    head: ["Provider type", "Purpose", "Data involved"],
                    rows: [
                        [
                            "Website hosting (Vercel)",
                            "Serving {{domain}}, security logs",
                            "IP address, request metadata",
                        ],
                        [
                            "Email provider",
                            "Sending and receiving project correspondence",
                            "Name, email, message content",
                        ],
                        [
                            "Cloud file storage / transfer",
                            "Delivering large render and source files",
                            "Client project materials",
                        ],
                        [
                            "Payment and invoicing provider",
                            "Taking payment and issuing invoices",
                            "Billing name, address, transaction data",
                        ],
                        [
                            "Analytics",
                            "Aggregate traffic measurement",
                            "Anonymised or aggregated usage data",
                        ],
                    ],
                },
                {
                    type: "paragraph",
                    text: "We may also disclose data where we are legally required to, or to establish or defend legal claims. If our business is ever transferred, personal data may transfer with it, and we will tell affected clients in advance.",
                },
            ],
        },
        {
            id: "international-transfers",
            title: "International transfers",
            summary:
                "We work with clients in the USA, UK and Europe from {{addressCountry}}, so data is transferred internationally under appropriate safeguards.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Where personal data leaves the UK or European Economic Area, we rely on Standard Contractual Clauses or an equivalent approved transfer mechanism with each provider, together with practical safeguards such as encryption in transit and access controls.",
                },
            ],
        },
        {
            id: "retention",
            title: "How long we keep data",
            summary:
                "Enquiries are kept up to {{legal.dataRetentionMonths}} months, project files for {{legal.dataRetentionMonths}} months after delivery, and invoices for as long as tax law requires.",
            blocks: [
                {
                    type: "table",
                    head: ["Data", "Retention period"],
                    rows: [
                        [
                            "Enquiries that do not become projects",
                            "Up to {{legal.dataRetentionMonths}} months, then deleted",
                        ],
                        [
                            "Project files and correspondence",
                            "{{legal.dataRetentionMonths}} months after final delivery, unless you ask us to keep or delete them sooner",
                        ],
                        [
                            "Invoices and accounting records",
                            "As required by applicable tax law",
                        ],
                        [
                            "Server and security logs",
                            "Short-term, per our hosting provider's defaults",
                        ],
                    ],
                },
                {
                    type: "paragraph",
                    text: "You can ask for earlier deletion at any time by emailing {{privacyEmail}}.",
                },
            ],
        },
        {
            id: "your-rights",
            title: "Your rights",
            summary:
                "You can request access, correction, deletion, restriction, portability, or object to processing — email {{privacyEmail}} and we respond within 30 days.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Access — get a copy of the personal data we hold about you.",
                        "Rectification — have inaccurate data corrected.",
                        "Erasure — have data deleted where we have no overriding reason to keep it.",
                        "Restriction — pause processing while a dispute is resolved.",
                        "Portability — receive your data in a machine-readable format.",
                        "Objection — object to processing based on legitimate interests, including direct marketing.",
                        "Withdraw consent — at any time, without affecting processing already carried out.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "California residents may additionally request disclosure of the categories of personal information collected and request deletion. We do not sell or share personal information as those terms are defined under the CCPA/CPRA, and we will not discriminate against you for exercising any right.",
                },
                {
                    type: "paragraph",
                    text: "If you are in the UK or EU and are unhappy with our response, you may complain to your national supervisory authority.",
                },
            ],
        },
        {
            id: "cookies",
            title: "Cookies and similar technologies",
            summary:
                "We use only essential cookies plus privacy-friendly analytics; we do not run third-party advertising or cross-site tracking pixels.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Essential — needed for the site to work, including your light or dark theme preference, which is stored locally in your browser and never sent to us.",
                        "Analytics — aggregate measurement of page visits so we know which services people are looking for.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "You can block or delete cookies in your browser settings. Blocking essential cookies may break parts of the site.",
                },
            ],
        },
        {
            id: "security",
            title: "Security",
            summary:
                "We use encrypted transfer, access controls and least-privilege sharing, though no method of transmission is completely secure.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "HTTPS across the whole site.",
                        "Access to client files limited to assigned team members.",
                        "Multi-factor authentication on studio accounts.",
                        "Expiring links for large file delivery where supported.",
                    ],
                },
                {
                    type: "paragraph",
                    text: "If you believe your data has been compromised, contact {{privacyEmail}} immediately. Where a breach is likely to result in a risk to your rights, we will notify you and any relevant regulator within the timeframes required by law.",
                },
            ],
        },
        {
            id: "children",
            title: "Children",
            summary:
                "Our services are for businesses; we do not knowingly collect data from anyone under {{legal.minimumAge}}.",
            blocks: [
                {
                    type: "paragraph",
                    text: "If you believe a child has provided us with personal data, contact {{privacyEmail}} and we will delete it.",
                },
            ],
        },
        {
            id: "changes",
            title: "Changes to this policy",
            summary:
                "We update this policy when our practices change, and the version and date at the top always reflect the current text.",
            blocks: [
                {
                    type: "paragraph",
                    text: "For material changes affecting active clients, we give at least {{legal.noticeDays}} days' notice by email before the change takes effect.",
                },
            ],
        },
        {
            id: "contact",
            title: "Contact us",
            summary:
                "Email {{privacyEmail}} for any privacy question, data request or NDA.",
            blocks: [
                {
                    type: "paragraph",
                    text: "{{legalName}}, {{addressLine}}. Email {{privacyEmail}} or message us on WhatsApp at {{phone}}. We aim to reply within two business days.",
                },
            ],
        },
    ],

    faq: [
        {
            question: "Does ProDesignity sell or share personal data?",
            answer: "No. ProDesignity does not sell, rent or trade personal data, and does not share client project files with advertisers or data brokers. Data is shared only with the service providers needed to host the site, send email, transfer files and take payment.",
        },
        {
            question:
                "Will my unreleased product appear in ProDesignity's portfolio?",
            answer: "Not without written permission. All client materials are treated as confidential by default, and finished work is only published to the portfolio once the client approves in writing. Permanent exclusions and embargo dates are honoured.",
        },
        {
            question: "Does ProDesignity upload client files to AI tools?",
            answer: "No. Confidential client materials such as CAD data, dielines and unreleased artwork are not submitted to public generative-AI services. Where AI-assisted software is used in production, it runs on business tiers configured so that inputs are not retained for model training.",
        },
        {
            question: "How long does ProDesignity keep project files?",
            answer: "Project files and correspondence are kept for {{legal.dataRetentionMonths}} months after final delivery so revisions remain possible, then removed from active storage. Clients can request earlier deletion at any time by emailing {{privacyEmail}}.",
        },
        {
            question: "Will ProDesignity sign an NDA?",
            answer: "Yes. ProDesignity treats client materials as confidential by default and will sign a client's own NDA before receiving files. Requests go to {{privacyEmail}}.",
        },
    ],

    closing:
        "This policy is written to be readable rather than defensive. If a clause affects a decision you are making, ask us and we will explain it plainly.",
};
