#!/bin/bash

# SmartSense Backend - Structure Verification Script
# This script verifies that the project follows strict MVC architecture

echo "================================================"
echo "SmartSense Backend - Structure Verification"
echo "================================================"
echo ""

BASE_DIR="src/main/java/com/smartsense"
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check annotation in file
check_annotation() {
    local file=$1
    local annotation=$2
    if [ -f "$file" ] && grep -q "@$annotation" "$file"; then
        echo -e "${GREEN}✓${NC} $file has @$annotation annotation"
        return 0
    else
        echo -e "${RED}✗${NC} $file missing @$annotation annotation"
        ((ERRORS++))
        return 1
    fi
}

# Function to warn if pattern found
warn_if_found() {
    local file=$1
    local pattern=$2
    local message=$3
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "${YELLOW}⚠${NC} $file: $message"
        ((WARNINGS++))
        return 1
    fi
    return 0
}

echo "1. Checking Directory Structure"
echo "--------------------------------"
check_directory "$BASE_DIR"
check_directory "$BASE_DIR/config"
check_directory "$BASE_DIR/controller"
check_directory "$BASE_DIR/service"
check_directory "$BASE_DIR/repository"
check_directory "$BASE_DIR/model"
echo ""

echo "2. Checking Main Application File"
echo "----------------------------------"
check_file "$BASE_DIR/SmartSenseApplication.java"
check_annotation "$BASE_DIR/SmartSenseApplication.java" "SpringBootApplication"
echo ""

echo "3. Checking Configuration Files"
echo "--------------------------------"
check_file "$BASE_DIR/config/SecurityConfig.java"
check_file "$BASE_DIR/config/JwtUtil.java"
check_file "$BASE_DIR/config/JwtAuthenticationFilter.java"
check_file "$BASE_DIR/config/JwtAuthenticationEntryPoint.java"
check_annotation "$BASE_DIR/config/SecurityConfig.java" "Configuration"
check_annotation "$BASE_DIR/config/JwtUtil.java" "Component"
echo ""

echo "4. Checking Controller Files"
echo "-----------------------------"
CONTROLLERS=(
    "AuthController.java"
    "AttendanceController.java"
    "StudentController.java"
    "EngagementController.java"
    "LectureController.java"
    "DashboardController.java"
)

for controller in "${CONTROLLERS[@]}"; do
    check_file "$BASE_DIR/controller/$controller"
    check_annotation "$BASE_DIR/controller/$controller" "RestController"

    # Check for MVC violations in Controller
    warn_if_found "$BASE_DIR/controller/$controller" "new.*Repository()" \
        "Controller should not instantiate Repository"
    warn_if_found "$BASE_DIR/controller/$controller" "@Transactional" \
        "Controller should not use @Transactional (use in Service)"
done
echo ""

echo "5. Checking Service Files"
echo "-------------------------"
SERVICES=(
    "UserDetailsServiceImpl.java"
    "AttendanceService.java"
    "FaceRecognitionService.java"
    "EngagementService.java"
    "LectureService.java"
    "DashboardService.java"
)

for service in "${SERVICES[@]}"; do
    check_file "$BASE_DIR/service/$service"
    check_annotation "$BASE_DIR/service/$service" "Service"

    # Check for MVC violations in Service
    warn_if_found "$BASE_DIR/service/$service" "ResponseEntity" \
        "Service should not return ResponseEntity (use in Controller)"
    warn_if_found "$BASE_DIR/service/$service" "@GetMapping\\|@PostMapping\\|@PutMapping\\|@DeleteMapping" \
        "Service should not have REST mappings"
    warn_if_found "$BASE_DIR/service/$service" "HttpServletRequest\\|HttpServletResponse" \
        "Service should not use Servlet objects"
done
echo ""

echo "6. Checking Repository Files"
echo "-----------------------------"
REPOSITORIES=(
    "UserRepository.java"
    "StudentRepository.java"
    "AttendanceRepository.java"
    "EngagementRepository.java"
    "AlertRepository.java"
    "LectureRepository.java"
    "LectureAccessRepository.java"
    "QuizResultRepository.java"
)

for repo in "${REPOSITORIES[@]}"; do
    check_file "$BASE_DIR/repository/$repo"
    check_annotation "$BASE_DIR/repository/$repo" "Repository"

    # Check that repository extends JpaRepository
    if [ -f "$BASE_DIR/repository/$repo" ] && ! grep -q "extends JpaRepository" "$BASE_DIR/repository/$repo"; then
        echo -e "${RED}✗${NC} $repo does not extend JpaRepository"
        ((ERRORS++))
    fi
done
echo ""

echo "7. Checking Model/Entity Files"
echo "-------------------------------"
MODELS=(
    "User.java"
    "Student.java"
    "Attendance.java"
    "Engagement.java"
    "Alert.java"
    "Lecture.java"
    "LectureAccess.java"
    "QuizResult.java"
)

for model in "${MODELS[@]}"; do
    check_file "$BASE_DIR/model/$model"
    check_annotation "$BASE_DIR/model/$model" "Entity"
done
echo ""

echo "8. Checking application.properties"
echo "-----------------------------------"
if [ -f "src/main/resources/application.properties" ]; then
    echo -e "${GREEN}✓${NC} application.properties exists"

    # Check for required properties
    REQUIRED_PROPS=(
        "spring.datasource.url"
        "spring.jpa.hibernate.ddl-auto"
        "jwt.secret"
    )

    for prop in "${REQUIRED_PROPS[@]}"; do
        if grep -q "^$prop" "src/main/resources/application.properties" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Property defined: $prop"
        else
            echo -e "${YELLOW}⚠${NC} Property not found: $prop"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${RED}✗${NC} application.properties missing"
    ((ERRORS++))
fi
echo ""

echo "9. Checking pom.xml Dependencies"
echo "---------------------------------"
if [ -f "pom.xml" ]; then
    echo -e "${GREEN}✓${NC} pom.xml exists"

    REQUIRED_DEPS=(
        "spring-boot-starter-web"
        "spring-boot-starter-data-jpa"
        "spring-boot-starter-security"
        "mysql-connector-java\\|mysql-connector-j"
    )

    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "$dep" "pom.xml"; then
            echo -e "${GREEN}✓${NC} Dependency found: $dep"
        else
            echo -e "${YELLOW}⚠${NC} Dependency not found: $dep"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${RED}✗${NC} pom.xml missing"
    ((ERRORS++))
fi
echo ""

echo "10. MVC Layer Separation Checks"
echo "--------------------------------"

# Check that Controllers don't have business logic patterns
echo "Checking Controllers for business logic..."
for controller in "${CONTROLLERS[@]}"; do
    if [ -f "$BASE_DIR/controller/$controller" ]; then
        # Look for complex if/else or for loops (signs of business logic)
        if grep -E "for\\s*\\(|while\\s*\\(|if\\s*\\(.{50,}" "$BASE_DIR/controller/$controller" >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠${NC} $controller may contain business logic (complex conditionals/loops)"
            ((WARNINGS++))
        fi
    fi
done

# Check that Services don't return ResponseEntity
echo "Checking Services for REST handling..."
for service in "${SERVICES[@]}"; do
    if [ -f "$BASE_DIR/service/$service" ]; then
        if grep -q "ResponseEntity" "$BASE_DIR/service/$service"; then
            echo -e "${YELLOW}⚠${NC} $service returns ResponseEntity (should be in Controller)"
            ((WARNINGS++))
        fi
    fi
done

# Check that Repositories are interfaces
echo "Checking Repositories are interfaces..."
for repo in "${REPOSITORIES[@]}"; do
    if [ -f "$BASE_DIR/repository/$repo" ]; then
        if ! grep -q "interface.*Repository" "$BASE_DIR/repository/$repo"; then
            echo -e "${RED}✗${NC} $repo should be an interface"
            ((ERRORS++))
        fi
    fi
done

echo ""
echo "================================================"
echo "Verification Results"
echo "================================================"
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Structure verification passed!${NC}"
    echo ""
    echo "MVC Architecture Compliance:"
    echo "  ✓ All required directories present"
    echo "  ✓ All required files present"
    echo "  ✓ Proper annotations used"
    echo "  ✓ Layer separation maintained"
    echo ""

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: $WARNINGS warnings found. Review warnings above.${NC}"
    fi

    exit 0
else
    echo -e "${RED}✗ Structure verification failed!${NC}"
    echo ""
    echo "Please fix the errors listed above."
    echo ""
    exit 1
fi
