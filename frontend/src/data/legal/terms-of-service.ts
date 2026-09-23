import type { LegalDocument } from "./types";

/**
 * data/legal/terms-of-service.ts
 * ---------------------------------------------------------------------------
 * Same editing rules as privacy-policy.ts: edit strings, bump `version`, set
 * `lastUpdated`. Commercial numbers (deposit, revision rounds, refund window)
 * live in config/site.ts under `legal` so they stay consistent everywhere.
 *
 * Template, not legal advice. The liability cap, IP transfer and governing-law
 * clauses in particular should be reviewed by a lawyer in your jurisdiction.
 */
export const termsOfService: LegalDocument = {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    description:
        "The terms that govern {{brand}} projects: scope and quotes, revisions, payment, intellectual property ownership, confidentiality and liability.",
    effectiveDate: "2026-08-23",
    lastUpdated: "2026-08-23",
    version: "1.0",

    intro: [
        "These terms govern your use of {{domain}} and any design or visualization work you engage {{brand}} (“we”, “us”) to produce. By using the site or accepting a quote, you agree to them.",
        "Where a signed statement of work or contract says something different, that document wins for that project.",
    ],

    sections: [
        {
            id: "definitions",
            title: "Definitions",
            summary:
                "“Deliverables” means the final files we hand over; “Client Materials” means everything you send us to make them.",
            blocks: [
                {
                    type: "definitions",
                    items: [
                        {
                            term: "Services",
                            description:
                                "3D product visualization, 3D product modeling and CAD, photorealistic product rendering and CGI, packaging design and mockups, product animation, and e-commerce listing visuals for Amazon and Shopify.",
                        },
                        {
                            term: "Deliverables",
                            description:
                                "The final approved files we deliver — rendered images, animations, packaging artwork, dielines, 3D models or listing graphics — in the formats set out in the quote.",
                        },
                        {
                            term: "Client Materials",
                            description:
                                "Product samples, photographs, CAD and STEP files, dielines, logos, fonts, copy and brand guidelines you supply.",
                        },
                        {
                            term: "Quote",
                            description:
                                "The written proposal setting out scope, deliverables, formats, price and timeline for a project.",
                        },
                    ],
                },
            ],
        },
        {
            id: "services-scope",
            title: "Services and scope",
            summary:
                "Every project is defined by a written quote; anything not listed in the quote is out of scope and priced separately.",
            blocks: [
                {
                    type: "paragraph",
                    text: "We confirm each project in writing before starting. The quote states the deliverables, the number of angles or scenes, output resolutions and file formats, the revision allowance and the delivery schedule.",
                },
                {
                    type: "list",
                    items: [
                        "Additional angles, scenes, SKUs, variants or formats requested after the quote is accepted are treated as new scope.",
                        "Changing product geometry, packaging structure or brand direction after modeling has begun may require re-modeling, quoted separately.",
                        "We will always tell you the cost impact before doing extra work.",
                    ],
                },
            ],
        },
        {
            id: "client-responsibilities",
            title: "Your responsibilities",
            summary:
                "Accurate reference material and timely feedback are what keep a project on schedule.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Supply usable reference: dimensioned drawings, CAD or STEP files, clear product photographs, print-ready artwork and correct dielines.",
                        "Confirm that you own or are licensed to use all Client Materials, including fonts, stock imagery, logos and third-party trademarks.",
                        "Consolidate feedback into a single response per review round.",
                        "Respond within {{legal.approvalWindowDays}} days at each review stage. Longer gaps move the delivery date.",
                    ],
                },
                {
                    type: "callout",
                    tone: "warning",
                    title: "Accuracy of source data",
                    text: "Renders and dielines are only as accurate as the data supplied. We are not responsible for print or manufacturing errors caused by incorrect dimensions, colour references or dielines provided to us.",
                },
            ],
        },
        {
            id: "revisions",
            title: "Revisions and approval",
            summary:
                "Each project includes {{legal.revisionRounds}} rounds of revisions within the agreed scope; further rounds are billed at our hourly rate.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Revisions cover refinements to work already scoped — lighting, camera, material finish, layout and typography adjustments. They do not cover a change of product, concept or creative direction, which is new scope.",
                },
                {
                    type: "paragraph",
                    text: "Where a project stage is not approved or commented on within {{legal.approvalWindowDays}} days of delivery, we may treat that stage as approved so later stages can proceed.",
                },
            ],
        },
        {
            id: "payment",
            title: "Fees and payment",
            summary:
                "Projects start on a {{legal.deposit}} deposit, with the balance due before final files are released.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "A {{legal.deposit}} deposit is required to schedule and begin work. It is non-refundable once production starts.",
                        "The balance is invoiced on approval of the final deliverables and is due before high-resolution or source files are released.",
                        "Longer engagements may be split into milestones as set out in the quote.",
                        "Prices exclude any taxes, duties or bank transfer fees, which are payable by you.",
                        "Invoices unpaid after {{legal.latePaymentTerms}} may pause work and incur reasonable late fees.",
                    ],
                },
                {
                    type: "callout",
                    tone: "info",
                    title: "Watermarked previews",
                    text: "Previews shared during review may be watermarked or reduced in resolution. They are for internal review only and must not be published or used commercially before final payment.",
                },
            ],
        },
        {
            id: "timelines",
            title: "Timelines and delays",
            summary:
                "Delivery dates in a quote assume timely feedback and complete source material.",
            blocks: [
                {
                    type: "paragraph",
                    text: "We plan capacity around agreed dates and communicate early if anything is at risk. Delays caused by late feedback, missing reference material, changes in scope, or events outside our reasonable control shift the schedule by at least the length of the delay.",
                },
            ],
        },
        {
            id: "intellectual-property",
            title: "Intellectual property and ownership",
            summary:
                "Full commercial rights in the final deliverables transfer to you once the project is paid in full; we retain our tools, techniques and pre-existing assets.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "On full payment, you receive worldwide, perpetual, exclusive rights to use the final approved deliverables for commercial purposes, including advertising, packaging, print and e-commerce listings.",
                        "Client Materials remain yours throughout.",
                        "We retain ownership of our underlying know-how, shaders, rigs, HDRI setups, scene templates, scripts and any generic assets not created specifically for you.",
                        "Source and working files — scene files, project files and layered originals — are not included by default. They can be licensed for an additional fee, agreed in writing.",
                        "Rights do not transfer until payment clears in full. Using unpaid deliverables commercially is a breach of these terms.",
                    ],
                },
            ],
        },
        {
            id: "portfolio",
            title: "Portfolio and promotional use",
            summary:
                "We may show completed work in our portfolio unless you tell us not to, and never before your product is public.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Unless you ask otherwise in writing, we may display completed deliverables on {{domain}}, in case studies, in social posts and in proposals, crediting your brand.",
                },
                {
                    type: "list",
                    items: [
                        "We never publish unreleased products, and we honour embargo dates.",
                        "You may request permanent exclusion at any time, before or after publication, and we will remove the work.",
                        "Where an NDA is in place, its terms override this section.",
                    ],
                },
            ],
        },
        {
            id: "confidentiality",
            title: "Confidentiality",
            summary:
                "Both sides keep the other's non-public information confidential, and we will sign your NDA on request.",
            blocks: [
                {
                    type: "paragraph",
                    text: "We treat product plans, launch dates, formulations, pricing and unreleased designs as confidential by default and limit access to the team working on your project. This obligation continues after the project ends.",
                },
            ],
        },
        {
            id: "third-party-assets",
            title: "Third-party assets and licensing",
            summary:
                "Fonts, stock models, HDRIs and stock imagery used in a project are licensed for that project's use, and licence costs are passed through.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Where a deliverable includes third-party licensed content, we tell you what it is and what the licence permits. Extending a licence to new media or territories is your responsibility unless we agree otherwise in writing.",
                },
            ],
        },
        {
            id: "cancellation",
            title: "Cancellation and refunds",
            summary:
                "You can cancel at any time; you pay for work completed up to that point, and the deposit is non-refundable once production has begun.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "Cancel within {{legal.refundWindowDays}} days of paying the deposit and before production begins for a full refund of the deposit.",
                        "After production begins, we invoice for work completed and hand over what has been produced to that point.",
                        "We may cancel a project for non-payment, abusive conduct, or if the work would require us to infringe someone else's rights, refunding any amount paid for work not yet done.",
                    ],
                },
            ],
        },
        {
            id: "acceptable-use",
            title: "Acceptable use of the website",
            summary:
                "Don't scrape, copy or misuse the site or the imagery on it.",
            blocks: [
                {
                    type: "list",
                    items: [
                        "All site content — images, renders, animations, copy, layout and code — is owned by {{brand}} or its clients and may not be reproduced without permission.",
                        "No automated scraping, bulk downloading or reverse engineering.",
                        "No attempt to disrupt, overload or gain unauthorised access to the site.",
                        "Quoting or citing our published material with attribution and a link is welcome.",
                    ],
                },
            ],
        },
        {
            id: "warranties",
            title: "Warranties and disclaimers",
            summary:
                "We warrant that the work is original and professionally produced; we do not guarantee commercial results such as sales or conversion rates.",
            blocks: [
                {
                    type: "paragraph",
                    text: "We warrant that deliverables are our original work or properly licensed, and that we will perform the services with reasonable skill and care consistent with professional industry standards.",
                },
                {
                    type: "paragraph",
                    text: "We do not warrant any specific business outcome. Conversion rate, ranking, click-through rate, sales volume and marketplace approval depend on factors outside our control, including your pricing, product, listing copy and platform policies.",
                },
                {
                    type: "paragraph",
                    text: "Rendered colour is calibrated as closely as possible but screen and print output differ. For packaging going to print, always confirm against a physical proof and your printer's colour profile before production.",
                },
                {
                    type: "paragraph",
                    text: "The website is provided “as is”. To the extent permitted by law, we exclude implied warranties of merchantability and fitness for a particular purpose.",
                },
            ],
        },
        {
            id: "liability",
            title: "Limitation of liability",
            summary:
                "Our total liability for a project is capped at the fees you paid for that project.",
            blocks: [
                {
                    type: "paragraph",
                    text: "To the fullest extent permitted by law, our aggregate liability arising out of or in connection with a project is limited to the total fees paid by you for that project. We are not liable for indirect or consequential loss, including lost profit, lost sales, print or manufacturing costs, or reputational harm.",
                },
                {
                    type: "paragraph",
                    text: "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",
                },
            ],
        },
        {
            id: "indemnity",
            title: "Indemnity",
            summary:
                "You cover us against claims arising from the materials you supply.",
            blocks: [
                {
                    type: "paragraph",
                    text: "You agree to indemnify us against claims, damages and reasonable costs arising from Client Materials you supply, including claims that they infringe a third party's intellectual property, or from your use of deliverables in a way not permitted by these terms.",
                },
            ],
        },
        {
            id: "force-majeure",
            title: "Events outside our control",
            summary:
                "Neither side is liable for delays caused by events genuinely outside their control.",
            blocks: [
                {
                    type: "paragraph",
                    text: "This includes natural disasters, war, civil unrest, epidemics, strikes, sustained power or internet outages, and government action. Where such an event continues beyond {{legal.noticeDays}} days, either side may end the project, with payment due for work completed.",
                },
            ],
        },
        {
            id: "governing-law",
            title: "Governing law and disputes",
            summary:
                "These terms are governed by {{legal.governingLaw}}, and we will try to resolve any dispute directly first.",
            blocks: [
                {
                    type: "paragraph",
                    text: "Any dispute is subject to the exclusive jurisdiction of {{legal.courts}}. Before starting proceedings, both sides agree to attempt resolution in good faith within {{legal.noticeDays}} days of written notice.",
                },
            ],
        },
        {
            id: "changes-to-terms",
            title: "Changes to these terms",
            summary:
                "Updated terms apply to new projects; active projects keep the version in force when the quote was accepted.",
            blocks: [
                {
                    type: "paragraph",
                    text: "The version number and date at the top of this page always show the current text. We give active clients at least {{legal.noticeDays}} days' notice of material changes.",
                },
            ],
        },
        {
            id: "contact-terms",
            title: "Contact",
            summary: "Questions about these terms go to {{email}}.",
            blocks: [
                {
                    type: "paragraph",
                    text: "{{legalName}}, {{addressLine}}. Email {{email}} or message us on WhatsApp at {{phone}}.",
                },
            ],
        },
    ],

    faq: [
        {
            question:
                "Who owns the 3D models and renders ProDesignity produces?",
            answer: "The client receives full worldwide commercial rights to the final approved deliverables once the project is paid in full. ProDesignity retains its own pre-existing tools, shaders and scene templates. Editable source and working files are not included by default and can be licensed for an additional fee.",
        },
        {
            question: "How many revisions are included in a project?",
            answer: "Each project includes {{legal.revisionRounds}} rounds of revisions within the agreed scope, covering lighting, camera, materials, layout and typography. A change of product, concept or creative direction counts as new scope and is quoted separately.",
        },
        {
            question: "What are ProDesignity's payment terms?",
            answer: "A {{legal.deposit}} deposit is required to schedule and begin a project, with the balance due on approval and before final high-resolution files are released. Larger engagements can be split into milestones.",
        },
        {
            question: "Can I get a refund if I cancel a project?",
            answer: "Cancelling within {{legal.refundWindowDays}} days of paying the deposit and before production begins gets a full deposit refund. After production starts, the client pays for completed work and receives what has been produced to that point.",
        },
        {
            question: "Will ProDesignity guarantee higher conversion rates?",
            answer: "No. ProDesignity warrants professional, original work but does not guarantee commercial outcomes such as sales, conversion rate or marketplace ranking, because those depend on pricing, product, listing copy and platform policies outside the studio's control.",
        },
        {
            question: "Does ProDesignity sign NDAs before receiving files?",
            answer: "Yes. Client materials are confidential by default, and ProDesignity will sign a client's own NDA before receiving product data or unreleased artwork.",
        },
    ],

    closing:
        "Short version: tell us what you need in writing, pay the deposit, give clear feedback, and the finished work is yours to use commercially once it's paid for.",
};
