import { MIN_WAGE, STUDENT_WAGE } from "./constants.js";

// Job catalog: "Name|typical hourly wage|t" (t = often earns tips, 0 = minimum wage)
export const CATALOG = {
  "Food & Drink": "Barista|0|t;Fast Food Worker|0;Server|0|t;Host / Hostess|0|t;Busser|0|t;Dishwasher|0;Line Cook|18.5;Prep Cook|0;Ice Cream Scooper|0|t;Bakery Assistant|0;Pizza Maker|0;Bubble Tea Maker|0|t;Sandwich Maker|0;Drive-Thru Attendant|0;Café Cashier|0|t;Deli Clerk|0;Food Truck Helper|0|t;Concession Stand Worker|0;Catering Assistant|18|t;Banquet Server|18|t;Smoothie Bar Staff|0|t;Donut Shop Crew|0",
  Retail: "Retail Associate|0;Cashier|0;Stock Associate|0;Grocery Clerk|0;Cart Attendant|0;Grocery Bagger|0;Visual Merchandiser|18.5;Fitting Room Attendant|0;Bookstore Clerk|0;Pharmacy Assistant|18;Pet Store Associate|0;Garden Centre Associate|0;Electronics Sales Associate|18;Sporting Goods Associate|0;Shoe Store Associate|0;Thrift Store Associate|0;Customer Service Desk|18;Toy Store Associate|0;Hardware Store Associate|18;Dollar Store Associate|0;Mall Kiosk Sales|0;Florist Assistant|0;Gift Wrapper (Holiday)|0",
  "Sports & Recreation": "Lifeguard|18.5;Swim Instructor|19.5;Camp Counsellor|19;Day Camp Leader|18.5;Soccer Referee|25;Hockey Referee|30;Baseball Umpire|22;Basketball Referee|25;Rink Attendant|0;Ski Lift Operator|18;Ski / Snowboard Instructor|18.5;Golf Course Attendant|0|t;Golf Caddie|18|t;Tennis Instructor|22;Gym Front Desk|0;Bowling Alley Attendant|0;Ride Operator|0;Movie Theatre Attendant|0;Arcade Attendant|0;Trampoline Park Staff|0;Climbing Gym Staff|18;Assistant Sports Coach|20;Assistant Dance Teacher|20;Skate Instructor|20;Martial Arts Assistant|18;Mini Golf Attendant|0;Water Park Attendant|0;Laser Tag Staff|0",
  "Kids & Teaching": "Babysitter|18;Nanny|19;Tutor|22;Math Tutor|25;Science Tutor|25;French Tutor|24;Language Tutor|24;Music Teacher (Piano)|28;Guitar Teacher|26;Coding Instructor|22;Chess Coach|20;Reading Buddy|0;After-School Program Assistant|18;Daycare Assistant|18;Library Aide|0;Library Page|0;March Break Camp Helper|0;Homework Helper|20;Test Prep Tutor|28",
  "Outdoor & Hands-On": "Landscaper|19;Lawn Mowing|20;Snow Shoveling|22;Farm Hand|0;Fruit Picker|0;Garden Helper|19;Painter’s Helper|19;Construction Labourer|20;Car Wash Attendant|0|t;Bike Mechanic|18.5;Moving Helper|20|t;Window Washer|19;Pool Cleaner|19;Tree Planter|22;Groundskeeper|18.5;Marina Dock Hand|18|t;Gas Station Attendant|0;Leaf Raking|20;Fence Painting|20;Recycling Depot Sorter|0",
  Animals: "Dog Walker|20;Pet Sitter|20;Kennel Attendant|0;Dog Groomer Assistant|0|t;Stable Hand|0;Vet Clinic Assistant|18;Animal Shelter Assistant|0;Doggy Daycare Staff|0;Aquarium Store Helper|0;Horse Camp Helper|0",
  "Office & Tech": "Receptionist|18;Office Assistant|18.5;Data Entry Clerk|18.5;IT Help Desk|20;Social Media Assistant|20;Web Designer (Freelance)|25;Graphic Designer (Freelance)|25;Video Editor (Freelance)|25;Call Centre Rep|19;Filing Clerk|0;Mail Room Clerk|0;Tech Support for Seniors|22;Website Tester|20;Spreadsheet Helper|20;Phone Repair Assistant|18.5",
  "Creative & Performing": "Content Creator|20;Freelance Writer|22;Event Photographer|25;Photographer’s Assistant|20;Party DJ|30|t;Face Painter|25|t;Balloon Artist|25|t;Mascot Performer|20;Musician (Gigs)|30|t;Children’s Party Entertainer|25|t;Theatre Usher|0;Stagehand|19;Art Class Assistant|0;Voice-Over Artist|30;Henna Artist|25|t",
  "Hospitality & Events": "Hotel Front Desk|18.5;Housekeeper|18.5|t;Bellhop|0|t;Event Staff|18|t;Stadium Concessions|0|t;Coat Check|0|t;Ticket Taker|0;Tour Guide|19|t;Museum Guide|19;Wedding Helper|20|t;Fair / Festival Staff|0;Conference Assistant|18.5;Parking Attendant|0",
  "Health & Community": "Dietary Aide (Seniors Home)|19;Recreation Aide|18.5;Personal Support Worker|21;Dental Office Assistant|19;Pharmacy Cashier|0;Community Centre Staff|18;Hospital Porter|19;Seniors Companion|20;Optometry Office Assistant|18.5",
  "Delivery & Warehouse": "Newspaper Carrier|0;Flyer Delivery|0;Bike Food Courier|0|t;Grocery Delivery|0|t;Warehouse Associate|19.5;Order Picker|19.5;Package Sorter|19.5;Shelf Stocker (Night)|19;Inventory Counter|18.5",
};

export const JOBS = {};
for (const [cat, list] of Object.entries(CATALOG)) {
  for (const item of list.split(";")) {
    const [name, w, t] = item.split("|");
    JOBS[name] = { cat, wage: +w || MIN_WAGE, tips: t === "t" };
  }
}
export const JOB_COUNT = Object.keys(JOBS).length;

// Minimum-wage jobs drop to the student rate for under-18s
export const studentAdjusted = (wage, age) => (+age < 18 && wage === MIN_WAGE ? STUDENT_WAGE : wage);
