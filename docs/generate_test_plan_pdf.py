#!/usr/bin/env python3
"""Generate FilmIN — Test Plan PDF (non-technical, shareable)."""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable,
)

NAVY  = colors.HexColor("#15233b")
INK   = colors.HexColor("#1f2733")
SLATE = colors.HexColor("#566074")
AMBER = colors.HexColor("#d98c2b")
GREEN = colors.HexColor("#1a7a4a")
RED   = colors.HexColor("#b94040")
GOLD  = colors.HexColor("#b07800")
LINE  = colors.HexColor("#d8dee8")
CARD  = colors.HexColor("#f5f7fb")
CARDLINE = colors.HexColor("#e1e7f0")
GREENBG  = colors.HexColor("#eaf6ef")
GOLDBG   = colors.HexColor("#fdf6e3")
REDBG    = colors.HexColor("#fdf0f0")
WHITE = colors.white

styles = getSampleStyleSheet()

def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)

body     = S("body",  fontName="Helvetica",      fontSize=10, leading=14.5, textColor=INK, spaceAfter=6)
small    = S("small", parent=body, fontSize=8.5, leading=12,  textColor=SLATE)
note     = S("note",  parent=body, fontSize=8.5, leading=12,  textColor=SLATE, leftIndent=10)
h1       = S("h1",    fontName="Helvetica-Bold",  fontSize=15, leading=19, textColor=NAVY, spaceBefore=14, spaceAfter=3)
h2       = S("h2",    fontName="Helvetica-Bold",  fontSize=11, leading=14, textColor=AMBER, spaceBefore=10, spaceAfter=3)
h3       = S("h3",    fontName="Helvetica-Bold",  fontSize=10, leading=13, textColor=NAVY, spaceBefore=7,  spaceAfter=2)
kicker   = S("kicker",fontName="Helvetica-Bold",  fontSize=8.5, leading=11, textColor=AMBER)
cover_title = S("cvt", fontName="Helvetica-Bold", fontSize=42, leading=46, textColor=NAVY, alignment=TA_CENTER)
cover_sub   = S("cvs", fontName="Helvetica",      fontSize=14, leading=18, textColor=SLATE, alignment=TA_CENTER)
cover_tag   = S("cvg", fontName="Helvetica-Oblique", fontSize=10, leading=15, textColor=INK, alignment=TA_CENTER)
tbl_head = S("th",  fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=WHITE,  alignment=TA_CENTER)
tbl_cell = S("tc",  fontName="Helvetica",      fontSize=8.5, leading=11, textColor=INK,    alignment=TA_CENTER)
tbl_cellL= S("tcL", parent=tbl_cell, alignment=TA_LEFT)

def bullets(items, st=body, li=12, gap=2):
    return ListFlowable(
        [ListItem(Paragraph(t, st), leftIndent=li, value="bullet") for t in items],
        bulletType="bullet", bulletColor=AMBER, bulletFontSize=8,
        leftIndent=li, spaceBefore=0, spaceAfter=gap,
    )

def section(title):
    return [Spacer(1,2), Paragraph(title, h1),
            HRFlowable(width="100%", thickness=1.1, color=AMBER, spaceBefore=1, spaceAfter=8)]

STATUS_STYLE = {
    "ready": (GREEN, GREENBG, "[READY TO TEST]"),
    "gap":   (GOLD,  GOLDBG,  "[GAP - TEST & NOTE]"),
    "later": (SLATE, CARD,    "[TEST LATER]"),
}

def scenario_block(code, status, who, goal, steps, expect, note_text=None):
    """Render one test scenario as a shaded card."""
    sc, bg, label = STATUS_STYLE[status]
    lines = []
    # header row: code + label
    hdr = Table(
        [[Paragraph(f"<b>{code}</b>", S(f"sc_h_{code}", fontName="Helvetica-Bold", fontSize=10, textColor=NAVY)),
          Paragraph(label, S(f"sc_l_{code}", fontName="Helvetica-Bold", fontSize=8.5, textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[4.5*inch, 2.2*inch],
    )
    hdr.setStyle(TableStyle([
        ("BACKGROUND", (1,0),(1,0), sc),
        ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
        ("LEFTPADDING",(0,0),(0,0),0), ("RIGHTPADDING",(1,0),(1,0),0),
        ("TOPPADDING",(0,0),(-1,-1),0), ("BOTTOMPADDING",(0,0),(-1,-1),0),
    ]))
    lines.append(hdr)
    lines.append(Spacer(1,4))

    def row(label_txt, content_txt):
        return Paragraph(f"<b>{label_txt}:</b> {content_txt}", body)

    lines.append(row("Who", who))
    lines.append(row("Goal", goal))
    lines.append(Paragraph("<b>Steps:</b>", body))
    step_items = [s.strip() for s in steps.split("|")]
    lines.append(bullets(step_items, st=S(f"st_{code}", parent=body, spaceAfter=1), li=14, gap=1))
    lines.append(row("Expect", expect))
    if note_text:
        lines.append(Paragraph(f"<i>Note: {note_text}</i>", note))
    lines.append(Spacer(1,3))
    lines.append(Paragraph(
        "<font color='#566074'>[  ] Pass &nbsp;&nbsp;&nbsp; [  ] Fail &nbsp;&nbsp;&nbsp; Notes: ___________________________________________</font>",
        S(f"tick_{code}", parent=small, leftIndent=0)
    ))

    outer = Table([[lines]], colWidths=[6.7*inch])
    outer.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), bg),
        ("BOX",(0,0),(-1,-1),0.7, sc),
        ("LEFTPADDING",(0,0),(-1,-1),9), ("RIGHTPADDING",(0,0),(-1,-1),9),
        ("TOPPADDING",(0,0),(-1,-1),7), ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
    ]))
    return KeepTogether([outer, Spacer(1,6)])

def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(SLATE)
        canvas.drawString(0.9*inch, 0.55*inch, "FilmIN — Test Plan")
        canvas.drawRightString(LETTER[0]-0.9*inch, 0.55*inch, f"Page {doc.page}")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(0.9*inch, 0.72*inch, LETTER[0]-0.9*inch, 0.72*inch)
    canvas.restoreState()

def legend_table():
    rows = [
        [Paragraph("Label", tbl_head), Paragraph("Meaning", tbl_head), Paragraph("What to do", tbl_head)],
        [Paragraph("[READY TO TEST]", S("lg1", fontName="Helvetica-Bold", fontSize=9, textColor=GREEN, alignment=TA_CENTER)),
         Paragraph("Built and working", tbl_cellL),
         Paragraph("Test it now; give feedback", tbl_cellL)],
        [Paragraph("[GAP - TEST &amp; NOTE]", S("lg2", fontName="Helvetica-Bold", fontSize=9, textColor=GOLD, alignment=TA_CENTER)),
         Paragraph("Should work but something is rough or missing", tbl_cellL),
         Paragraph("Test it; expect an edge — note what you find", tbl_cellL)],
        [Paragraph("[TEST LATER]", S("lg3", fontName="Helvetica-Bold", fontSize=9, textColor=SLATE, alignment=TA_CENTER)),
         Paragraph("Planned, not built yet", tbl_cellL),
         Paragraph("Skip for now — listed so you know it is coming", tbl_cellL)],
    ]
    t = Table(rows, colWidths=[1.8*inch, 2.6*inch, 2.3*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[GREENBG, GOLDBG, CARD]),
        ("GRID",(0,0),(-1,-1),0.5,LINE),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
    ]))
    return t

def build():
    doc = BaseDocTemplate(
        "/Users/azizhassouneh/filmin/docs/FilmIN-Test-Plan.pdf",
        pagesize=LETTER, topMargin=0.8*inch, bottomMargin=0.85*inch,
        leftMargin=0.9*inch, rightMargin=0.9*inch,
        title="FilmIN — Test Plan",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])
    e = []

    # ---- COVER ----
    e.append(Spacer(1, 1.5*inch))
    e.append(Paragraph("FilmIN", cover_title))
    e.append(Spacer(1, 6))
    e.append(Paragraph("Test Plan &amp; Scenario Checklist", cover_sub))
    e.append(Spacer(1, 16))
    e.append(HRFlowable(width="40%", thickness=1.5, color=AMBER, hAlign="CENTER"))
    e.append(Spacer(1, 16))
    e.append(Paragraph(
        "A hands-on testing guide for every persona and feature. "
        "For each scenario: follow the steps, tick Pass or Fail, and jot any notes.",
        cover_tag))
    e.append(Spacer(1, 28))
    cred_rows = [[
        Paragraph("<b>Test account 1</b>", S("c1", fontName="Helvetica-Bold", fontSize=9, textColor=NAVY)),
        Paragraph("alice@filmin.test &nbsp;&nbsp; password: password123",
                  S("c2", fontName="Helvetica", fontSize=9, textColor=INK)),
    ],[
        Paragraph("<b>Test account 2</b>", S("c3", fontName="Helvetica-Bold", fontSize=9, textColor=NAVY)),
        Paragraph("bob@filmin.test &nbsp;&nbsp; password: password123",
                  S("c4", fontName="Helvetica", fontSize=9, textColor=INK)),
    ]]
    ct = Table(cred_rows, colWidths=[1.5*inch, 3.8*inch], hAlign="CENTER")
    ct.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),CARD),
        ("BOX",(0,0),(-1,-1),0.7,CARDLINE),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    e.append(ct)
    e.append(Spacer(1, 18))
    e.append(Paragraph(
        "App URL (runs on Aziz's computer): http://localhost:3000  |  June 2026",
        S("covermeta", parent=small, alignment=TA_CENTER)
    ))
    e.append(PageBreak())

    # ---- HOW TO USE ----
    e += section("How to Use This Document")
    e.append(Paragraph(
        "FilmIN is currently a <b>development version</b> running only on Aziz's computer "
        "at <b>http://localhost:3000</b>. It is not on the internet yet, so testing "
        "remotely requires a screen-share with Aziz.", body))
    e.append(Spacer(1, 4))
    e.append(Paragraph("<b>Two ready-made accounts are provided above.</b> You can also "
        "click <b>Join free</b> to create your own account at any time.", body))
    e.append(Spacer(1, 6))
    e.append(Paragraph("Status key:", h3))
    e.append(legend_table())
    e.append(Spacer(1, 10))
    e.append(Paragraph("<b>For each scenario card:</b>", h3))
    e.append(bullets([
        "Read <b>Who</b>, <b>Goal</b>, and <b>Steps</b> before doing anything.",
        "Follow the steps exactly, then check whether the result matches <b>Expect</b>.",
        "Tick <b>Pass</b> or <b>Fail</b> and write any notes — confusing labels, slow loads, "
        "errors, or ideas all count.",
        "If a scenario is marked <b>[TEST LATER]</b>, skip it for this round.",
    ]))
    e.append(PageBreak())

    # ---- QUICK SUMMARY ----
    e += section("Quick Summary — What to Test Now vs Later")
    e.append(Paragraph("Test <b>now</b> (the built MVP):", h3))
    e.append(bullets([
        "Sign up and sign in",
        "Browse the home page and trending titles",
        "Search for a movie or TV show; open its page and see cast &amp; crew",
        "Search for a person; open their page and see their filmography",
        "Claim your own page (\"This is me\")",
        "Edit your page (name, roles, location, bio, reel/website/Instagram links)",
        "<b>Upload a headshot for free</b> (the headline feature)",
        "Toggle \"Open to work\" and see the amber badge appear",
        "Follow and unfollow someone",
        "Write a post; see it in your feed",
        "See posts from people you follow in your feed; like and unlike them",
    ], gap=3))
    e.append(Spacer(1, 6))
    e.append(Paragraph("Test <b>later</b> (not built yet):", h3))
    e.append(bullets([
        "Sign out (currently no sign-out button exists — flagged as a gap)",
        "\"Worked-with\" collaborator list on a profile page",
        "Adding your own student/indie titles and credits",
        "Requesting a correction to a wrong or missing credit",
        "Searching people by role, location, or skill (filters)",
        "Shortlists, contacting/messaging people, mutual connections, endorsements",
        "Comments on posts",
        "Watchlists, ratings, reviews (the fan layer)",
        "Critic pages and published reviews",
        "Notifications, verification badges, reporting/moderation",
    ], gap=3))
    e.append(PageBreak())

    # ==== SECTION A — Account & Access ====
    e += section("Section A — Account &amp; Access")

    e.append(scenario_block(
        "A1", "ready",
        who="Anyone new to FilmIN (e.g. Maya the aspiring actor)",
        goal="Create a free account.",
        steps="Click <b>Join free</b> in the top right corner|"
              "Enter your name, email address, and a password|"
              "Click the submit / sign-up button",
        expect="You are now signed in and land on the home page. "
               "The top bar now shows <b>Feed</b> and <b>Me</b> instead of sign-in buttons.",
    ))

    e.append(scenario_block(
        "A2", "ready",
        who="A returning user (use alice@filmin.test / password123)",
        goal="Sign back into an existing account.",
        steps="Click <b>Sign in</b> in the top right corner|"
              "Enter the email address and password|"
              "Click sign in",
        expect="You are signed in and land on the home page.",
    ))

    e.append(scenario_block(
        "A3", "gap",
        who="Anyone who mistypes their login details",
        goal="See a clear, friendly error message (not a crash).",
        steps="Click <b>Sign in</b>|"
              "Type a wrong password and submit|"
              "Try again with an email that has never been registered",
        expect="A readable error message appears explaining what went wrong. "
               "The page does not crash or go blank.",
        note_text="Check: does the message make sense to a non-technical person?",
    ))

    e.append(scenario_block(
        "A4", "gap",
        who="Anyone who wants to log out (important on a shared computer)",
        goal="Sign out of the app.",
        steps="Look in the top navigation bar for a Sign out or Log out option|"
              "Look in any menu or dropdown that appears when you click your name",
        expect="There should be a way to sign out.",
        note_text="There is currently NO sign-out button anywhere in the app. "
                  "This is a known gap. For now, the only workaround is to use an "
                  "incognito/private browser window or clear cookies.",
    ))

    e.append(scenario_block(
        "A5", "later",
        who="Anyone locked out",
        goal="Reset a forgotten password.",
        steps="(Not built yet — skip this scenario for now)",
        expect="A password reset email is sent.",
    ))

    e.append(PageBreak())

    # ==== SECTION B — Catalog & Discovery ====
    e += section("Section B — Catalog &amp; Discovery")

    e.append(scenario_block(
        "B1", "ready",
        who="Joe, a general fan visiting for the first time",
        goal="See something appealing on arrival without having to search.",
        steps="Go to the home page (http://localhost:3000)|"
              "Look at the layout, any images, and any title rows",
        expect="A welcome/hero area appears, plus a <b>Trending now</b> row showing "
               "recent movie and TV show posters.",
        note_text="Does it feel inviting? Are the posters loading correctly?",
    ))

    e.append(scenario_block(
        "B2", "ready",
        who="Joe, looking for a specific film",
        goal="Find a 2025-2026 movie or TV show by name.",
        steps="Click <b>Search</b>|"
              "Type a title such as Captain America: Brave New World, Thunderbolts, "
              "Elio, or Fantastic 4: First Steps|"
              "Look at the results",
        expect="Matching titles appear under a <b>Titles</b> heading.",
    ))

    e.append(scenario_block(
        "B3", "ready",
        who="Joe or Quinn (the film fan)",
        goal="See who worked on a title and jump to a person's page.",
        steps="Click a title from your search results|"
              "Read the poster, year, and summary on the title page|"
              "Scroll down to the <b>Cast</b> and <b>Crew</b> sections|"
              "Click on one person's name",
        expect="The title page shows all the details. "
               "Cast and crew are listed and their names are clickable links "
               "that take you to that person's profile page.",
    ))

    e.append(scenario_block(
        "B4", "ready",
        who="Carmen (casting director) or any fan",
        goal="Find a specific person by name.",
        steps="Click <b>Search</b>|"
              "Type a person's name (try someone from a 2025-2026 title you know)|"
              "Look under the <b>People</b> heading in the results",
        expect="Matching people appear with their main role shown. "
               "Clicking a name opens their profile page.",
    ))

    e.append(scenario_block(
        "B5", "ready",
        who="Anyone",
        goal="See a graceful 'nothing found' message when there are no results.",
        steps="Click <b>Search</b>|"
              "Type something nonsensical, like: zzzzzqqq",
        expect="A clear 'no results' message appears. The page does not crash.",
    ))

    e.append(scenario_block(
        "B6", "ready",
        who="Anyone (this is a legal / compliance check)",
        goal="Confirm that FilmIN credits its data source (TMDB).",
        steps="Scroll to the very bottom of any page|"
              "Look in the footer",
        expect="A line crediting TMDB appears, something like "
               "\"uses the TMDB API but is not endorsed by TMDB.\"",
    ))

    e.append(scenario_block(
        "B7", "later",
        who="Anyone wanting to narrow a search",
        goal="Filter or sort the catalog by year, genre, or popularity.",
        steps="(Not built yet — search is name-based only for now)",
        expect="Filter and sort controls appear alongside search results.",
    ))

    e.append(PageBreak())

    # ==== SECTION C — Professional Identity ====
    e += section("Section C — Professional Identity")
    e.append(Paragraph(
        "<i>This section covers the core \"IMDbPro killer\" feature: claiming and editing "
        "your own page for free, including uploading a headshot.</i>", note))
    e.append(Spacer(1, 4))

    e.append(scenario_block(
        "C1", "ready",
        who="Maya, an aspiring actor (or any professional with an imported page)",
        goal="Take ownership of your own page on FilmIN.",
        steps="Search for a person who has not been claimed yet (the page will show an "
              "\"Unclaimed\" badge)|"
              "On their page, find and click <b>Claim this page &mdash; free</b>|"
              "If you are not signed in, sign in first|"
              "Confirm the claim",
        expect="The page becomes yours. An <b>Edit your page</b> link appears. "
               "The \"Unclaimed\" badge disappears.",
        note_text="Was the 'this is me' moment obvious and satisfying?",
    ))

    e.append(scenario_block(
        "C2", "ready",
        who="Maya, Dev, Noor, or any claimed professional",
        goal="Fill in your professional details on your page.",
        steps="On your page, click <b>Edit</b>|"
              "Set your <b>Display name</b> (required)|"
              "Add your <b>Roles</b> as comma-separated text, e.g. Actor, Choreographer|"
              "Add your <b>Location</b> and <b>Bio</b>|"
              "Fill in any link fields: Reel URL, Website, Instagram|"
              "Save the changes",
        expect="All changes save successfully and show on your public profile page.",
    ))

    e.append(scenario_block(
        "C3", "ready",
        who="Maya (this is the headline feature IMDbPro charges $150/yr for)",
        goal="Upload a profile photo for free.",
        steps="On the edit page, find the <b>Upload a headshot</b> section|"
              "Choose a JPEG, PNG, or WebP image file under 5 MB from your computer|"
              "Wait for it to upload",
        expect="The photo appears as your headshot on your profile page. "
               "No payment screen, no paywall, no fee. Free.",
        note_text="How fast does it upload? Does the image look crisp? "
                  "Any unexpected errors?",
    ))

    e.append(scenario_block(
        "C4", "gap",
        who="Maya, accidentally picking the wrong file type or a very large image",
        goal="See a clear, friendly message explaining the limit.",
        steps="On the edit page, try uploading a PDF file|"
              "Try uploading a very large image (over 5 MB)",
        expect="A readable error message explains what file types are allowed and the size limit.",
    ))

    e.append(scenario_block(
        "C5", "ready",
        who="Sam the cinematographer, available for hire",
        goal="Signal to the industry that you are available for work.",
        steps="On the edit page, tick the <b>Open to work</b> checkbox|"
              "Save|"
              "View your public profile page",
        expect="An amber <b>Open to work</b> badge appears on your page.",
    ))

    e.append(scenario_block(
        "C6", "ready",
        who="Sam or Noor, a professional with film credits",
        goal="See your film and TV credits listed on your page.",
        steps="Open any person's profile page (search for them)|"
              "Scroll down to the <b>Filmography</b> section",
        expect="Their credits are listed with the title and year, newest first. "
               "Each title is a clickable link.",
    ))

    e.append(scenario_block(
        "C7", "ready",
        who="Any signed-in user",
        goal="Jump to your own profile page quickly.",
        steps="Click <b>Me</b> in the top navigation bar",
        expect="If you have claimed a page, it opens directly. "
               "If not, you see a message prompting you to search and claim one.",
    ))

    e.append(scenario_block(
        "C8", "later",
        who="Maya or Sam, wanting richer profile options",
        goal="Add skills or tags; embed a reel video directly (not just a link).",
        steps="(Not built yet)",
        expect="Skill tags and an embedded video player appear on the edit page.",
    ))

    e.append(scenario_block(
        "C9", "later",
        who="Theo, a film student with no existing credits",
        goal="Create a profile from scratch and add student/indie films as titles.",
        steps="(Not built yet)",
        expect="Theo can add new titles and credits that are not in the imported catalog.",
    ))

    e.append(scenario_block(
        "C10", "later",
        who="Priya, a costume designer with a wrong or missing credit",
        goal="Request a correction to a credit on a title page.",
        steps="(Not built yet)",
        expect="A correction request form appears and the credit is updated after review.",
    ))

    e.append(PageBreak())

    # ==== SECTION D — Networking & Feed ====
    e += section("Section D — Networking &amp; Feed")

    e.append(scenario_block(
        "D1", "ready",
        who="Quinn the cinephile, or any user",
        goal="Follow someone whose work you admire.",
        steps="Open another person's <b>claimed</b> profile page "
              "(unclaimed pages do not have a Follow button)|"
              "Click <b>Follow</b>",
        expect="The button changes to <b>Following</b> or <b>Unfollow</b>. "
               "The follower count on their page increases by one.",
        note_text="You cannot follow your own page.",
    ))

    e.append(scenario_block(
        "D2", "ready",
        who="Same as above",
        goal="Unfollow someone you no longer want to follow.",
        steps="On a profile page you are already following, click <b>Following</b> or <b>Unfollow</b>",
        expect="You stop following them. The follower count decreases by one.",
    ))

    e.append(scenario_block(
        "D3", "ready",
        who="Sam (or any claimed professional)",
        goal="Share a professional update with your followers.",
        steps="Click <b>Feed</b> in the top navigation|"
              "Find the composer box at the top (it says something like 'Share an update...')|"
              "Type a short post|"
              "Click <b>Post</b>",
        expect="Your post appears in the feed immediately.",
    ))

    e.append(scenario_block(
        "D4", "ready",
        who="Noor, following Sam",
        goal="See posts from people you follow in your feed.",
        steps="Using one account, follow a second user's profile|"
              "Using the second account (open a separate browser window or use "
              "alice@filmin.test and bob@filmin.test), write a post|"
              "Switch back to the first account and open <b>Feed</b>",
        expect="The second user's post appears in the first user's feed.",
        note_text="Because there is no sign-out button yet, use two separate browser "
                  "windows or one regular and one incognito window to be signed in as "
                  "both accounts at once.",
    ))

    e.append(scenario_block(
        "D5", "ready",
        who="Anyone reading the feed",
        goal="Like and unlike a post.",
        steps="In the feed, find a post|"
              "Click the heart icon on the post|"
              "Click it again to undo",
        expect="The heart fills in when liked and empties when unliked. "
               "The like count changes accordingly.",
    ))

    e.append(scenario_block(
        "D6", "later",
        who="Anyone",
        goal="Comment on a post.",
        steps="(Not built yet — likes only, no comments yet)",
        expect="A comment box and comment thread appear below each post.",
    ))

    e.append(scenario_block(
        "D7", "later",
        who="Sam, wanting to anchor a post to a specific title",
        goal="Write a post that is linked to a film or TV show.",
        steps="(Not built yet — posts are plain text only)",
        expect="A 'tag a title' option appears in the post composer.",
    ))

    e.append(scenario_block(
        "D8", "later",
        who="Alex assembling a crew, or Quinn exploring collaborations",
        goal="See a list of people a person has worked with on their profile.",
        steps="(Not built yet — the data exists but is not shown on the profile page)",
        expect="A 'Worked with' section appears on profile pages, "
               "showing people who share film credits.",
    ))

    e.append(PageBreak())

    # ==== SECTION E — Hiring (future) ====
    e += section("Section E — Hiring &amp; Discovery")
    e.append(Paragraph(
        "<i>All scenarios in this section are coming later. "
        "Listed here so you know what is planned.</i>", note))
    e.append(Spacer(1, 6))

    for code, who, goal in [
        ("E1", "Carmen, casting director",
         "Search for people by role, location, or skill (e.g. 'Choreographer, LA')."),
        ("E2", "Carmen or Alex",
         "Save a shortlist of people for a project."),
        ("E3", "Carmen contacting Lia",
         "Contact a person directly through FilmIN, for free."),
        ("E4", "Jordan the agent",
         "Manage a roster of clients and promote their pages."),
        ("E5", "Studio production company",
         "Have a company / production-company page."),
        ("E6", "Festival programmer",
         "Discover emerging filmmakers through festival-specific surfaces."),
    ]:
        e.append(scenario_block(
            code, "later",
            who=who, goal=goal,
            steps="(Not built yet)",
            expect="Feature works as described.",
        ))

    e.append(PageBreak())

    # ==== SECTION F/G — Fan & Critic (future) ====
    e += section("Section F — Fan Engagement &amp; Critic Tools")
    e.append(Paragraph(
        "<i>Follow (already in Section D) works today. "
        "Everything else here is coming later.</i>", note))
    e.append(Spacer(1, 6))

    for code, who, goal in [
        ("F1", "Joe or Quinn", "Follow a favourite actor or director (already works — see D1)."),
        ("F2", "Quinn", "Save titles to a personal watchlist."),
        ("F3", "Quinn", "Rate or review a film."),
        ("G1", "Rae the critic", "Publish reviews on a personal critic page."),
    ]:
        status = "ready" if code == "F1" else "later"
        e.append(scenario_block(
            code, status,
            who=who, goal=goal,
            steps="See Scenario D1" if code == "F1" else "(Not built yet)",
            expect="Feature works as described.",
        ))

    e.append(PageBreak())

    # ==== PERSONA MAP ====
    e += section("Persona &rarr; Scenario Map")
    e.append(Paragraph(
        "Use this table to quickly find the scenarios that matter most to each "
        "person testing the app.", body))
    e.append(Spacer(1, 6))

    map_head = [Paragraph(h, tbl_head) for h in ["Persona", "Test now (ready)", "Coming later"]]
    map_rows = [
        ["Maya — aspiring actor",         "A1, C1, C2, C3 (free headshot!), C4, C5", "C8, C9"],
        ["Sam — cinematographer/DP",      "C1, C5, C6, D3, D4, D5",                  "D7, D8"],
        ["Lia — choreographer",           "C1, C2, C5",                               "E1, E3"],
        ["Dev — screenwriter",            "C1, C2, C6",                               "C9"],
        ["Noor — director",               "A2, D1, D4, D5",                           "D8, E1"],
        ["Alex — producer",               "B4, D1",                                   "D8, E1, E2"],
        ["Theo — film student",           "A1, C1, C2",                               "C9"],
        ["Priya — costume designer",      "C1, C2, C6",                               "C10"],
        ["Carmen — casting director",     "B4",                                        "E1, E2, E3"],
        ["Jordan — agent/manager",        "B4",                                        "E4"],
        ["Studio — production company",   "B2, B4",                                   "E5"],
        ["Festival — programmer",         "B2, B4",                                   "E6"],
        ["Joe — general fan",             "B1, B2, B3, D1",                           "F2"],
        ["Quinn — cinephile",             "B3, D1, D5",                               "D8, F2, F3"],
        ["Rae — film critic",             "B2, B3",                                   "G1"],
    ]
    data = [map_head]
    for r in map_rows:
        data.append([Paragraph(r[0], tbl_cellL), Paragraph(r[1], tbl_cell), Paragraph(r[2], tbl_cell)])
    t = Table(data, colWidths=[2.1*inch, 2.8*inch, 1.8*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, CARD]),
        ("GRID",(0,0),(-1,-1),0.5,LINE),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
    ]))
    e.append(t)
    e.append(PageBreak())

    # ==== OVERALL FEEDBACK ====
    e += section("Overall Feedback")
    questions = [
        ("First impression", "Does it feel like a real, finished product?"),
        ("Free headshot upload", "The headline feature (C3) — how did it feel? Fast? Smooth?"),
        ("Most confusing moment", "Anything unclear, unexpected, or hard to find?"),
        ("Most missed feature", "What did you reach for that was not there?"),
        ("Any errors or crashes", "Blank pages, error messages, anything broken?"),
        ("Would a working film professional use this?", "Why or why not?"),
        ("What one thing would most improve it?", "Your top priority suggestion."),
    ]
    for q_short, q_full in questions:
        e.append(Paragraph(f"<b>{q_short}</b>", h3))
        e.append(Paragraph(q_full, note))
        e.append(Paragraph(
            "_" * 80,
            S(f"ln_{q_short[:5]}", fontName="Helvetica", fontSize=10, textColor=LINE)
        ))
        e.append(Spacer(1, 4))

    e.append(Spacer(1, 12))
    e.append(HRFlowable(width="100%", thickness=0.6, color=LINE))
    e.append(Spacer(1, 5))
    e.append(Paragraph(
        "Catalog data from TMDB (themoviedb.org). This product uses the TMDB API "
        "but is not endorsed or certified by TMDB. FilmIN never scrapes IMDb. "
        "FilmIN is free forever for users.",
        small))

    doc.build(e)
    print("WROTE /Users/azizhassouneh/filmin/docs/FilmIN-Test-Plan.pdf")

if __name__ == "__main__":
    build()
