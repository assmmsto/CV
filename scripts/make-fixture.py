"""Generate a real text-based CV PDF fixture (English + Arabic lines) for import E2E tests."""
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

OUT = "/home/z/my-project/scripts/fixtures/sample-cv.pdf"

c = canvas.Canvas(OUT, pagesize=A4)
w, h = A4
y = h - 30 * mm

def line(text, size=11, bold=False, dy=7 * mm, x=25 * mm):
    global y
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, text)
    y -= dy

line("Mohammed Abdullah Al-Saeed", 20, bold=True, dy=10 * mm)
line("Senior Software Engineer", 13, dy=7 * mm)
line("Email: mohammed@example.com", 10)
line("Phone: +963 944 555 123", 10)
line("City: Damascus, Syria", 10)
line("LinkedIn: linkedin.com/in/mohammed", 10, dy=10 * mm)

line("PROFESSIONAL SUMMARY", 13, bold=True, dy=8 * mm)
line("Software engineer with 8 years of experience building large-scale", 10)
line("web applications with React and Node.js. Led teams of 6 engineers.", 10, dy=10 * mm)

line("WORK EXPERIENCE", 13, bold=True, dy=8 * mm)
line("Senior Software Engineer - Advanced Tech Co, Damascus", 11, bold=True)
line("03/2020 - Present", 10)
line("Led a team of 6 engineers building the main platform.", 10)
line("Improved system performance by 40%.", 10, dy=10 * mm)
line("Application Developer - Levant Banks, Aleppo", 11, bold=True)
line("06/2016 - 02/2020", 10)
line("Developed electronic banking systems.", 10, dy=10 * mm)

line("EDUCATION", 13, bold=True, dy=8 * mm)
line("MSc, Software Engineering - Damascus University", 11, bold=True)
line("2012 - 2014, Grade: Excellent", 10, dy=10 * mm)

line("SKILLS", 13, bold=True, dy=8 * mm)
line("React / Next.js, Node.js, Team Leadership, TypeScript", 10, dy=10 * mm)

line("LANGUAGES", 13, bold=True, dy=8 * mm)
line("Arabic (Native), English (Fluent)", 10, dy=10 * mm)

line("CERTIFICATIONS", 13, bold=True, dy=8 * mm)
line("AWS Solutions Architect - Amazon, 2022", 10, dy=10 * mm)

c.showPage()
c.save()
print("fixture written:", OUT)
