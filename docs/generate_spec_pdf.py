#!/usr/bin/env python3
"""Generate FilmIN — Product Requirements & Scenarios Spec (clean & simple PDF)."""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, Flowable, HRFlowable,
)

# ---- palette ----
NAVY = colors.HexColor("#15233b")
INK = colors.HexColor("#1f2733")
SLATE = colors.HexColor("#566074")
AMBER = colors.HexColor("#d98c2b")
LINE = colors.HexColor("#d8dee8")
CARD = colors.HexColor("#f5f7fb")
CARDLINE = colors.HexColor("#e1e7f0")
WHITE = colors.white

styles = getSampleStyleSheet()

def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)

body = S("body", fontName="Helvetica", fontSize=10, leading=14.5, textColor=INK, spaceAfter=6)
small = S("small", parent=body, fontSize=8.5, leading=12, textColor=SLATE)
h1 = S("h1", fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=NAVY, spaceBefore=16, spaceAfter=3)
h2 = S("h2", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=AMBER, spaceBefore=10, spaceAfter=3)
kicker = S("kicker", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=AMBER)
cardName = S("cardName", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=NAVY)
cardBody = S("cardBody", fontName="Helvetica", fontSize=8.8, leading=12, textColor=INK)
cover_title = S("cover_title", fontName="Helvetica-Bold", fontSize=46, leading=50, textColor=NAVY, alignment=TA_CENTER)
cover_sub = S("cover_sub", fontName="Helvetica", fontSize=15, leading=20, textColor=SLATE, alignment=TA_CENTER)
cover_tag = S("cover_tag", fontName="Helvetica-Oblique", fontSize=11, leading=16, textColor=INK, alignment=TA_CENTER)
tbl_head = S("tbl_head", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=WHITE, alignment=TA_CENTER)
tbl_cell = S("tbl_cell", fontName="Helvetica", fontSize=8.5, leading=11, textColor=INK, alignment=TA_CENTER)
tbl_cellL = S("tbl_cellL", parent=tbl_cell, alignment=TA_LEFT)

def bullets(items, st=body, leftIndent=12, gap=2):
    return ListFlowable(
        [ListItem(Paragraph(t, st), leftIndent=leftIndent, value="•") for t in items],
        bulletType="bullet", bulletColor=AMBER, bulletFontSize=8, leftIndent=leftIndent, spaceBefore=0, spaceAfter=gap,
    )

def section(title):
    return [Spacer(1, 2), Paragraph(title, h1), HRFlowable(width="100%", thickness=1.1, color=AMBER, spaceBefore=1, spaceAfter=8)]

def persona_card(name, role, goals, frustration, filmin):
    inner = []
    inner.append(Paragraph(f"{name} &mdash; <font color='#566074'>{role}</font>", cardName))
    inner.append(Spacer(1, 2))
    inner.append(Paragraph(f"<b>Goals:</b> {goals}", cardBody))
    inner.append(Paragraph(f"<b>Frustration:</b> {frustration}", cardBody))
    inner.append(Paragraph(f"<b>FilmIN gives them:</b> {filmin}", cardBody))
    t = Table([[inner]], colWidths=[3.35*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), CARD),
        ("BOX", (0,0), (-1,-1), 0.7, CARDLINE),
        ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
        ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return t

def card_grid(cards):
    """Lay persona cards two per row."""
    rows = []
    for i in range(0, len(cards), 2):
        pair = cards[i:i+2]
        if len(pair) == 1:
            pair.append("")
        rows.append(pair)
    t = Table(rows, colWidths=[3.55*inch, 3.55*inch], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 3), ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))
    return t

# ---------- relationship diagram ----------
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

def box(d, x, y, w, h, label, fill=NAVY, fg=WHITE):
    d.add(Rect(x, y, w, h, rx=6, ry=6, fillColor=fill, strokeColor=fill))
    d.add(String(x+w/2, y+h/2-4, label, fontName="Helvetica-Bold", fontSize=10, fillColor=fg, textAnchor="middle"))

def connect(d, x1, y1, x2, y2, label):
    d.add(Line(x1, y1, x2, y2, strokeColor=SLATE, strokeWidth=1.2))
    mx, my = (x1+x2)/2, (y1+y2)/2
    d.add(String(mx, my+3, label, fontName="Helvetica", fontSize=7.5, fillColor=AMBER, textAnchor="middle"))

def relationship_diagram():
    d = Drawing(470, 220)
    bw, bh = 120, 34
    # positions
    profile = (175, 150)   # center top
    user    = (20, 60)
    title   = (330, 150)
    post    = (175, 30)
    fan     = (330, 30)
    box(d, *profile, bw, bh, "Profile", NAVY)
    box(d, *user, bw, bh, "User (account)", AMBER, INK)
    box(d, *title, bw, bh, "Title", NAVY)
    box(d, *post, bw, bh, "Post", colors.HexColor("#3d5a80"))
    box(d, *fan, bw, bh, "Fan", AMBER, INK)
    # edges (from center points)
    connect(d, 140, 77,  175, 167, "claims / follows")
    connect(d, 295, 167, 330, 167, "credit")
    connect(d, 235, 150, 235, 64,  "authors")
    connect(d, 390, 64,  390, 150, "follows")
    # worked-with loop note on profile
    d.add(String(235, 195, "Profile <-> Profile: worked-with (shared titles)",
                 fontName="Helvetica-Oblique", fontSize=7.5, fillColor=SLATE, textAnchor="middle"))
    return d

# ---------- document ----------
def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(SLATE)
        canvas.drawString(0.9*inch, 0.55*inch, "FilmIN — Product Requirements & Scenarios Spec")
        canvas.drawRightString(LETTER[0]-0.9*inch, 0.55*inch, f"Page {doc.page}")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(0.9*inch, 0.72*inch, LETTER[0]-0.9*inch, 0.72*inch)
    canvas.restoreState()

def build():
    doc = BaseDocTemplate(
        "/Users/azizhassouneh/filmin/docs/FilmIN-Product-Spec.pdf",
        pagesize=LETTER, topMargin=0.8*inch, bottomMargin=0.85*inch,
        leftMargin=0.9*inch, rightMargin=0.9*inch, title="FilmIN — Product Requirements & Scenarios Spec",
        author="FilmIN",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])
    e = []

    # ---- COVER ----
    e.append(Spacer(1, 1.7*inch))
    e.append(Paragraph("FilmIN", cover_title))
    e.append(Spacer(1, 6))
    e.append(Paragraph("Product Requirements &amp; Scenarios Spec", cover_sub))
    e.append(Spacer(1, 18))
    e.append(HRFlowable(width="40%", thickness=1.5, color=AMBER, hAlign="CENTER"))
    e.append(Spacer(1, 18))
    e.append(Paragraph("The open film &amp; TV catalog of IMDb, fused with a LinkedIn-style "
                       "professional network &mdash; built for the film industry.", cover_tag))
    e.append(Spacer(1, 26))
    badge = Table([[Paragraph("FREE FOREVER  &bull;  FUNDED BY ADS, NOT PAYWALLS",
                              S("badge", fontName="Helvetica-Bold", fontSize=10, textColor=WHITE, alignment=TA_CENTER))]],
                  colWidths=[4.6*inch])
    badge.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("TOPPADDING",(0,0),(-1,-1),8),
                               ("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    badge.hAlign = "CENTER"
    e.append(badge)
    e.append(Spacer(1, 0.9*inch))
    e.append(Paragraph("Working codename: FilmIN  ·  Draft v0.1  ·  June 21, 2026",
                       S("covermeta", parent=small, alignment=TA_CENTER)))
    e.append(PageBreak())

    # ---- A1 Vision ----
    e += section("1. Vision")
    e.append(Paragraph("FilmIN is the professional home for everyone who makes film &mdash; and the best place "
        "for fans to explore it. One trustworthy catalog of titles and credits, fused with a real professional "
        "network: owned profiles, connections, a feed, discovery, and hiring. <b>Free for everyone, funded by "
        "ads, never by gatekeeping people from their own work.</b>", body))

    # ---- A2 Value prop ----
    e += section("2. Value Proposition — “Why FilmIN”")
    e.append(bullets([
        "<b>Free forever for users</b> &mdash; page curation, headshot/photo uploads, credits management, "
        "discovery analytics, search, and contact tools that IMDbPro charges for are all free here.",
        "<b>Owned professional identity</b> &mdash; you control your page, your reel, your story.",
        "<b>Real industry networking</b> &mdash; connect, follow, endorse, post, get discovered, find "
        "collaborators and work.",
        "<b>A catalog both sides trust</b> &mdash; accurate, TMDB-powered titles and credits that fans and pros use.",
        "<b>Funded by ads, not paywalls</b> &mdash; monetization (later) never blocks a pro from managing their page.",
    ]))

    # ---- A3 Problem ----
    e += section("3. The Problem Today")
    e.append(bullets([
        "<b>IMDb</b> is resented; its moat is brand authority, not product quality. <b>IMDbPro</b> paywalls "
        "self-curation &mdash; you pay $150/yr to upload your own headshot.",
        "<b>LinkedIn</b> is generic &mdash; no titles, no credits graph, no reels, no fan layer; not film-literate.",
        "<b>Letterboxd</b> is fans-only &mdash; no professional identity or hiring layer.",
        "<b>Fragmentation</b> &mdash; pros juggle IMDb + LinkedIn + a personal site + a Vimeo reel + spreadsheets. "
        "FilmIN unifies all of it, free.",
    ]))

    # ---- A4 Personas ----
    e += section("4. Personas")
    e.append(Paragraph("Grouped as <b>Creators</b> (the pros), <b>Industry enablers</b> (who hire, represent, "
        "or program), <b>Audience</b> (fans &amp; press), and <b>Advertisers</b> (future).", body))

    e.append(Spacer(1, 4)); e.append(Paragraph("CREATORS — FILM PROFESSIONALS", kicker)); e.append(Spacer(1,4))
    creators = [
        persona_card("Maya", "Aspiring Actor", "Visibility, polished headshots + reel, get cast.",
                     "Paying IMDbPro just to upload a headshot.",
                     "Claim page, curate, upload photos free; be discovered by casting."),
        persona_card("Sam", "Cinematographer / DP", "Accurate credits, peer connections, signal availability.",
                     "Credits scattered; no film-aware network.",
                     "Verified filmography, “open to work,” worked-with network, posts."),
        persona_card("Lia", "Choreographer", "Be searchable in an under-catalogued role; show a reel.",
                     "Specialty roles poorly represented on IMDb.",
                     "First-class support for below-the-line roles + showreel + discovery."),
        persona_card("Dev", "Writer / Screenwriter", "Showcase produced + spec work; reach directors/producers.",
                     "No good way to present a body of writing.",
                     "Credits + projects + networking + endorsements."),
        persona_card("Noor", "Director", "Showcase filmography, assemble crews, announce projects.",
                     "Hiring + portfolio live in different places.",
                     "Profile, people search, worked-with graph, feed."),
        persona_card("Alex", "Producer", "Discover/assemble talent &amp; crew, manage a slate, network.",
                     "Sourcing trusted crew is slow and gated.",
                     "People search, shortlists, worked-with graph."),
        persona_card("Theo", "Film Student / Emerging", "Build a profile with no IMDb credits yet; first break.",
                     "IMDb won’t list student/indie work; invisible.",
                     "Add your own titles + credits; build identity from scratch."),
        persona_card("Priya", "Costume Designer", "Correct credit attribution; peer recognition.",
                     "Miscredited / missing on titles.",
                     "Claim, fix/add credits, endorsements."),
    ]
    e.append(card_grid(creators))

    e.append(Spacer(1, 8)); e.append(Paragraph("INDUSTRY ENABLERS", kicker)); e.append(Spacer(1,4))
    enablers = [
        persona_card("Carmen", "Casting Director", "Find &amp; shortlist talent by role/location/skills; contact them.",
                     "IMDbPro gates search &amp; contact behind a fee.",
                     "Rich people search + filters + shortlists + free direct contact."),
        persona_card("Jordan", "Agent / Manager", "Manage and promote a roster of clients.",
                     "No film-native tools to promote talent.",
                     "Manage client pages, promote, network."),
        persona_card("Studio", "Production Co. / Recruiter", "Source crews, scout, post opportunities (future).",
                     "Crewing-up relies on word of mouth.",
                     "Search + worked-with graph + company presence (future)."),
        persona_card("Festival", "Festival Programmer", "Discover filmmakers; partnerships and promotion.",
                     "Hard to find/track emerging filmmakers.",
                     "Discovery + partnership surfaces (a marketing channel)."),
    ]
    e.append(card_grid(enablers))

    e.append(Spacer(1, 8)); e.append(Paragraph("AUDIENCE  ·  (FUTURE) ADVERTISERS", kicker)); e.append(Spacer(1,4))
    audience = [
        persona_card("Joe", "General Fan", "“Who was in that?”, release dates, fast answers.",
                     "Cluttered, ad-heavy lookups.",
                     "Fast, clean catalog; follow talent."),
        persona_card("Quinn", "Cinephile (Letterboxd crowd)", "Track films; follow talent &amp; critics; rate/review.",
                     "Fan tools and pro data live apart.",
                     "Catalog + follows + watchlists/reviews (future)."),
        persona_card("Rae", "Critic / Journalist", "Publish reviews/articles; build authority; get cited.",
                     "Work gets cited to IMDb, not to them.",
                     "Critic pages + reviews; cite FilmIN over IMDb (future)."),
        persona_card("Brandr", "Advertiser / Brand (future)", "Reach a film-intent audience.",
                     "Generic ad networks lack film context.",
                     "Ad-friendly surfaces designed without harming UX."),
    ]
    e.append(card_grid(audience))

    e.append(PageBreak())

    # ---- A5 Segments ----
    e += section("5. User Segments (from the brief)")
    seg_rows = [
        [Paragraph("Segment", tbl_head), Paragraph("Share", tbl_head), Paragraph("How FilmIN wins them", tbl_head)],
        [Paragraph("<b>SUBSET ONE</b><br/>General public", tbl_cellL), Paragraph("~90%", tbl_cell),
         Paragraph("Catalog lookups. Won by speed, accuracy, SEO, brand.", tbl_cellL)],
        [Paragraph("<b>SUBSET TWO</b><br/>Working / semi-pro<br/><font color='#d98c2b'><b>THE WEDGE</b></font>", tbl_cellL), Paragraph("~9%", tbl_cell),
         Paragraph("Want free self-curation. Easiest to win; they evangelize to peers (grassroots growth).", tbl_cellL)],
        [Paragraph("<b>SUBSET THREE</b><br/>Established pros &amp; companies", tbl_cellL), Paragraph("&lt;1%", tbl_cell),
         Paragraph("Previously IMDbPro payers. Pay nothing here; won by a better product + network effect.", tbl_cellL)],
    ]
    t = Table(seg_rows, colWidths=[1.7*inch, 0.7*inch, 4.3*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY), ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, CARD]),
        ("GRID",(0,0),(-1,-1),0.5,LINE), ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
    ]))
    e.append(t)

    # ---- A6 Capabilities ----
    e += section("6. Capabilities &amp; Feature Areas")
    e.append(Paragraph("Tag <b>[MVP]</b> = in the first thin vertical slice; <b>[Later]</b> = roadmap.", small))
    e.append(Spacer(1,4))
    caps = [
        "<b>A. Catalog &amp; Discovery</b> &mdash; [MVP] title pages (poster, year, synopsis), cast/crew, title search, trending rows, and a <b>Discover</b> browse page (role chips, trending, new releases, people to follow).",
        "<b>B. Professional Identity</b> &mdash; [MVP] claim a page, profile (bio, roles, location, links), free headshot/photo upload; [Later] skills/tags, reel gallery.",
        "<b>C. Credits &amp; Filmography</b> &mdash; [MVP] profile&ndash;title credits; [Later] add missing titles/credits (student/indie), correction requests.",
        "<b>D. Professional Network</b> &mdash; [MVP] follow, worked-with (derived from shared titles), and <b>“people you may know”</b> suggestions; [Later] mutual connections, endorsements, “open to work.”",
        "<b>E. Feed &amp; Posts</b> &mdash; [MVP] a <b>personalized network feed on Home</b> (posts + worked-with activity from your network, ranked by recency and proximity, with an <b>extended-network</b> tier), posts/updates, likes; [Later] comments.",
        "<b>F. Hiring &amp; Discovery</b> &mdash; [Later] people search by role/location/skills, shortlists, direct contact (all free).",
        "<b>G. Fan Engagement</b> &mdash; [MVP] follow talent; [Later] watchlists, ratings/reviews.",
        "<b>H. Critic &amp; Editorial</b> &mdash; [Later] critic pages, reviews/articles.",
        "<b>I. Notifications</b> &mdash; [Later].",
        "<b>J. Trust &amp; Safety</b> &mdash; [Later] verification badges (claimed/verified pro), reporting/moderation.",
        "<b>K. Ads &amp; Monetization</b> &mdash; [Later] (ad-friendly layout considered now).",
    ]
    e.append(bullets(caps, gap=3))

    # ---- A7 Graph ----
    e += section("7. The FilmIN Graph (Relationships)")
    e.append(Paragraph("The product is a graph connecting people, their work, and the audience:", body))
    e.append(bullets([
        "<b>Person &mdash;[Credit: role/character/job]&mdash; Title</b> &mdash; the spine of the catalog.",
        "<b>Person &mdash;[Worked-with]&mdash; Person</b> &mdash; derived automatically from shared titles.",
        "<b>User &mdash;[Owns/Claims]&mdash; Profile</b> &mdash; a profile is an <i>unclaimed stub</i> until a user claims it.",
        "<b>User &mdash;[Follows]&mdash;&gt; Profile</b>; (future) <b>Person &lt;-&gt; Person</b> mutual connection + endorsement.",
        "<b>Person &mdash;[Authors]&mdash; Post &mdash;[Reaction]&mdash; User.</b>",
        "<b>Fan &mdash;[Follows]&mdash;&gt; Talent</b>; (future) Fan &mdash;[Watchlist/Rating]&mdash; Title.",
    ]))
    e.append(Spacer(1, 6))
    e.append(KeepTogether(relationship_diagram()))

    e.append(PageBreak())

    # ---- A8 Scenarios ----
    e += section("8. Scenarios (End-to-End Use Cases)")
    e.append(Paragraph("Each scenario: persona &middot; trigger &middot; steps &middot; outcome. "
                       "<b>[MVP]</b> = supported by the first thin slice.", small))
    e.append(Spacer(1,4))
    scen = [
        ("S1 [MVP] — The free headshot (Maya).", "Signs up, searches her imported page, clicks “This is me” to "
         "claim it, edits bio/roles, and uploads headshots for free. <i>Value: the headline IMDbPro-killer.</i>"),
        ("S2 [Later] — Casting a choreographer (Carmen &rarr; Lia).", "Searches “Choreographer, LA, musical "
         "theatre,” shortlists Lia, views her reel, and contacts her &mdash; all free. <i>Value: hiring without paywalls.</i>"),
        ("S3 [Later] — Building from zero (Theo).", "With no IMDb credits, creates a profile, adds his student films "
         "as titles + credits, and connects with classmates. <i>Value: emerging talent gets an identity IMDb won’t give.</i>"),
        ("S4 [MVP] — Open to work (Sam &rarr; Noor).", "Sam marks “open to work” and posts a wrap announcement; "
         "Noor (in Sam&rsquo;s network) sees it on her <b>Home</b> feed and connects. Posts from friends-of-friends "
         "surface in an <b>extended-network</b> tier, and <b>“people you may know”</b> suggests collaborators. "
         "<i>Value: the network creates work.</i>"),
        ("S5 [MVP] — Fan lookup (Joe).", "Searches a film; the title page shows cast/crew linked to profiles; he "
         "follows an actor. <i>Value: fast, credible catalog; fan&rarr;talent follow graph.</i>"),
        ("S6 [Later] — Fixing a credit (Priya).", "Finds a missing/mis-attributed credit on a title and requests a "
         "correction; the credit is fixed. <i>Value: accuracy owned by the people who did the work.</i>"),
        ("S7 [Later] — Assembling a crew (Alex).", "Uses people search and the worked-with graph to assemble a trusted crew."),
        ("S8 [Later] — Critic citations (Rae).", "Publishes reviews on a critic page; outlets cite FilmIN over IMDb."),
        ("S9 [MVP] — Following talent + worked-with (Quinn).", "Browses people on <b>Discover</b>, follows talent, and "
         "explores who they’ve worked with via shared titles."),
    ]
    for head, txt in scen:
        e.append(Paragraph(head, S("scenh", parent=body, fontName="Helvetica-Bold", textColor=NAVY, spaceAfter=1)))
        e.append(Paragraph(txt, S("scenb", parent=body, leftIndent=10, spaceAfter=7)))

    # ---- A9 Differentiators ----
    e += section("9. Differentiators (vs the Field)")
    diff_head = [Paragraph(h, tbl_head) for h in ["Capability","IMDb","IMDbPro","LinkedIn","Letterboxd","FilmIN"]]
    diff_rows = [
        ["Open film/TV catalog","Yes","Yes","No","Fan","Yes"],
        ["Self-curate page / upload headshots","No","Paid","Generic","No","Yes (free)"],
        ["Film-aware credits graph","View","Yes","No","No","Yes"],
        ["Professional networking &amp; hiring","No","Partial/paid","Generic","No","Yes (free)"],
        ["Fan engagement layer","Yes","No","No","Yes","Yes"],
        ["Cost to professionals","Free (view)","$150/yr","Free/paid","Free","$0"],
    ]
    data = [diff_head]
    for r in diff_rows:
        data.append([Paragraph(r[0], tbl_cellL)] + [Paragraph(c, tbl_cell) for c in r[1:]])
    t = Table(data, colWidths=[2.3*inch,0.78*inch,0.85*inch,0.85*inch,0.92*inch,0.92*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY), ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, CARD]),
        ("GRID",(0,0),(-1,-1),0.5,LINE), ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("BACKGROUND",(5,1),(5,-1),colors.HexColor("#fbf1e2")),
    ]))
    e.append(t)

    # ---- A10 Principles ----
    e += section("10. Principles (Non-Functional)")
    e.append(bullets([
        "Free core forever; the user owns their data and identity.",
        "Catalog accuracy; accessibility; fast and mobile-friendly.",
        "SEO for fan traffic (SUBSET ONE growth).",
        "Privacy-respecting; legal (TMDB attribution; no IMDb data or scraping).",
        "Ad-friendly, but never UX-hostile.",
    ]))

    # ---- A11 Metrics ----
    e += section("11. Success Metrics")
    e.append(bullets([
        "Claimed profiles; headshots uploaded; % of credits on claimed pages.",
        "Connections/follows created; weekly active users (pros vs fans).",
        "Catalog coverage; casting/people searches (future); grassroots referral signups.",
    ]))

    # ---- A12 Monetization ----
    e += section("12. Monetization (Future, Post-Traction)")
    e.append(Paragraph("Ads &middot; sponsored discovery placements &middot; festival/casting partnerships &middot; "
        "product placement. <b>Hard rule: never paywall a professional’s own page or core networking.</b> "
        "Outcome per the brief: scale ad revenue, or acquisition.", body))

    # ---- A13 Glossary ----
    e += section("13. Glossary")
    e.append(bullets([
        "<b>Title</b> &mdash; a film or TV work.",
        "<b>Credit</b> &mdash; a person’s role on a title.",
        "<b>Profile</b> &mdash; a person’s page; an <i>unclaimed stub</i> until <i>claimed</i> by its owner.",
        "<b>Claim</b> &mdash; proving/asserting a page is yours.",
        "<b>Follow</b> (one-way) vs <b>Connection</b> (mutual, future).",
        "<b>Worked-with</b> &mdash; a link between people derived from shared titles.",
        "<b>Reel</b> &mdash; a showcase video. <b>Endorsement</b> &mdash; a peer vouch (future).",
    ]))
    e.append(Spacer(1, 14))
    e.append(HRFlowable(width="100%", thickness=0.6, color=LINE))
    e.append(Spacer(1, 5))
    e.append(Paragraph("This product uses the TMDB API but is not endorsed or certified by TMDB. "
                       "No IMDb data is used or scraped.", small))

    doc.build(e)
    print("WROTE /Users/azizhassouneh/filmin/docs/FilmIN-Product-Spec.pdf")

if __name__ == "__main__":
    build()
