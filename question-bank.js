const SUPABASE_URL = "https://tmzktgsizjmoekfohabv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jdNFUnuzchK_Pad5-wmwYw_kKOX9X0n";

const sbClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

async function testConnection() {
    const status = document.getElementById("qb-status");

    try {
    const { data, error } = await sbClient
        .from("departments")
        .select("id, name, short_code")
        .order("name");

    if (error) {
        throw error;
    }

    status.classList.remove("error");
    status.textContent =
        "Connected successfully! Departments found: " +
        data.length +
        ". " +
        data.map((department) => department.name).join(", ");

    } catch (error) {
    console.error("Supabase connection error:", error);
    status.classList.add("error");
    status.textContent =
        "Connection failed. Check the browser console for details.";
    }

        
}

    

let allCourses = [];

async function loadCourses() {
  const coursesContainer = document.getElementById("qb-courses");
  const departmentFilter = document.getElementById("qb-department");
  const semesterFilter = document.getElementById("qb-semester");
  const searchInput = document.getElementById("qb-search");

  try {
    coursesContainer.textContent = "Loading courses...";

    const { data, error } = await sbClient
      .from("courses")
      .select(`
        id,
        course_code,
        course_name,
        semester,
        departments (
          id,
          name,
          short_code
        )
      `)
      .order("semester", { ascending: true });

    if (error) throw error;

    allCourses = data || [];

    // Populate department dropdown without duplicates
    const departments = new Map();

    allCourses.forEach((course) => {
      const department = course.departments;

      if (department) {
        departments.set(String(department.id), department);
      }
    });

    departmentFilter.replaceChildren(
      new Option("All Departments", "")
    );

    [...departments.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((department) => {
        departmentFilter.add(
          new Option(department.name, String(department.id))
        );
      });

    // Render the initial course list
    renderCourses();

    // Update results whenever a filter changes
    departmentFilter.addEventListener("change", renderCourses);
    semesterFilter.addEventListener("change", renderCourses);
    searchInput.addEventListener("input", renderCourses);

  } catch (error) {
    console.error("Course loading error:", error);
    coursesContainer.textContent =
      "Unable to load courses. Please refresh and try again.";
  }
}

function renderCourses() {
  const coursesContainer = document.getElementById("qb-courses");
  const departmentId = document.getElementById("qb-department").value;
  const semester = document.getElementById("qb-semester").value;
  const searchTerm = document
    .getElementById("qb-search")
    .value.trim()
    .toLowerCase();

  const filteredCourses = allCourses.filter((course) => {
    const matchesDepartment =
      !departmentId ||
      String(course.departments?.id) === departmentId;

    const matchesSemester =
      !semester ||
      String(course.semester) === semester;

    const matchesSearch =
      course.course_name.toLowerCase().includes(searchTerm) ||
      course.course_code.toLowerCase().includes(searchTerm) ||
      (course.departments?.name || "")
        .toLowerCase()
        .includes(searchTerm);

    return matchesDepartment && matchesSemester && matchesSearch;
  });

  coursesContainer.replaceChildren();

  if (filteredCourses.length === 0) {
    coursesContainer.textContent =
      "No matching courses found. Try changing your filters.";
    return;
  }

  filteredCourses.forEach((course) => {
    const card = document.createElement("article");

    const title = document.createElement("h3");
    title.textContent = course.course_name;

    const details = document.createElement("p");
    details.textContent =
      course.course_code +
      " | Semester " + course.semester +
      " | " + (course.departments?.name || "Department");

    
    const resourcesArea = document.createElement("div");
    resourcesArea.className = "qb-course-resources";
    resourcesArea.textContent = "Resources will appear here.";
    
    card.append(title, details);
    coursesContainer.appendChild(card);
  });
}



testConnection();
loadCourses();