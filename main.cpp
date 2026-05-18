#include <algorithm>
#include <cctype>
#include <fstream>
#include <iostream>
#include <map>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct User {
    std::string name;
    std::string email;
    int exp;
    std::set<std::string> connectedUsers;
};

int levelForExp(int exp) {
    return (std::max(0, exp) / 100) + 1;
}

// Stores participants in a simple local text file.
// Format: email<TAB>name<TAB>exp<TAB>connected_email,connected_email
class UserDatabase {
public:
    static constexpr int connectionExpReward = 10;

    explicit UserDatabase(std::string filePath) : path(std::move(filePath)) {
        load();
    }

    bool addUser(const std::string& rawName, const std::string& rawEmail) {
        const std::string name = cleanText(rawName);
        const std::string email = normalizeEmail(rawEmail);

        if (name.empty()) {
            throw std::invalid_argument("Name cannot be empty.");
        }

        if (!isValidEmail(email)) {
            throw std::invalid_argument("That does not look like a valid email address.");
        }

        const bool inserted = users.emplace(email, User{name, email, 0, {}}).second;
        if (!inserted) {
            users[email].name = name;
        }

        save();
        return inserted;
    }

    bool connectUsers(const std::string& firstEmail, const std::string& secondEmail) {
        const std::string first = normalizeEmail(firstEmail);
        const std::string second = normalizeEmail(secondEmail);

        if (first == second) {
            throw std::invalid_argument("A user cannot connect with themselves.");
        }

        requireUser(first);
        requireUser(second);

        const bool inserted = users[first].connectedUsers.insert(second).second;
        users[second].connectedUsers.insert(first);

        if (!inserted) {
            return false;
        }

        users[first].exp += connectionExpReward;
        users[second].exp += connectionExpReward;
        save();
        return true;
    }

    const User& getUser(const std::string& rawEmail) const {
        return requireUser(normalizeEmail(rawEmail));
    }

    std::vector<User> listUsers() const {
        std::vector<User> result;
        for (const auto& [_, user] : users) {
            result.push_back(user);
        }
        return result;
    }

    std::size_t count() const {
        return users.size();
    }

private:
    std::string path;
    // The email is used as the unique key for each user.
    std::map<std::string, User> users;

    // Keep the tab-separated database format from breaking if text contains whitespace.
    static std::string cleanText(const std::string& value) {
        std::string cleaned = trim(value);

        std::replace(cleaned.begin(), cleaned.end(), '\t', ' ');
        std::replace(cleaned.begin(), cleaned.end(), '\n', ' ');
        std::replace(cleaned.begin(), cleaned.end(), '\r', ' ');

        return cleaned;
    }

    static std::string trim(const std::string& value) {
        const auto first = std::find_if_not(value.begin(), value.end(), [](unsigned char c) {
            return std::isspace(c);
        });

        const auto last = std::find_if_not(value.rbegin(), value.rend(), [](unsigned char c) {
            return std::isspace(c);
        }).base();

        if (first >= last) {
            return "";
        }

        return {first, last};
    }

    static std::string normalizeEmail(const std::string& value) {
        std::string email = trim(value);
        std::transform(email.begin(), email.end(), email.begin(), [](unsigned char c) {
            return static_cast<char>(std::tolower(c));
        });

        return email;
    }

    static bool isValidEmail(const std::string& email) {
        const auto at = email.find('@');
        const auto dot = email.rfind('.');

        return at != std::string::npos &&
               at > 0 &&
               dot != std::string::npos &&
               dot > at + 1 &&
               dot + 1 < email.size() &&
               email.find(' ') == std::string::npos &&
               email.find('\t') == std::string::npos;
    }

    static int parseExp(const std::string& value) {
        try {
            const int parsed = std::stoi(value);
            return parsed < 0 ? 0 : parsed;
        } catch (...) {
            return 0;
        }
    }

    const User& requireUser(const std::string& email) const {
        const auto found = users.find(email);
        if (found == users.end()) {
            throw std::invalid_argument("No user found with email: " + email);
        }

        return found->second;
    }

    static std::vector<std::string> split(const std::string& value, char delimiter) {
        std::vector<std::string> parts;
        std::string current;

        for (const char c : value) {
            if (c == delimiter) {
                parts.push_back(current);
                current.clear();
            } else {
                current += c;
            }
        }

        parts.push_back(current);
        return parts;
    }

    void load() {
        std::ifstream input(path);
        std::string line;

        // Invalid or incomplete lines are skipped so one bad row does not break the app.
        while (std::getline(input, line)) {
            const std::vector<std::string> columns = split(line, '\t');
            if (columns.size() < 2) {
                continue;
            }

            const std::string email = normalizeEmail(columns[0]);
            const std::string name = cleanText(columns[1]);

            if (!isValidEmail(email) || name.empty()) {
                continue;
            }

            const bool hasExpColumn = columns.size() >= 4;
            User user{name, email, hasExpColumn ? parseExp(columns[2]) : 0, {}};
            const std::string connectedColumn = hasExpColumn ? columns[3] : (columns.size() >= 3 ? columns[2] : "");

            if (!connectedColumn.empty()) {
                for (const auto& connectedEmail : split(connectedColumn, ',')) {
                    const std::string normalized = normalizeEmail(connectedEmail);
                    if (isValidEmail(normalized) && normalized != email) {
                        user.connectedUsers.insert(normalized);
                    }
                }
            }

            users[email] = user;
        }
    }

    void save() const {
        std::ofstream output(path, std::ios::trunc);
        if (!output) {
            throw std::runtime_error("Could not open user database for writing.");
        }

        for (const auto& [_, user] : users) {
            output << user.email << '\t' << user.name << '\t' << user.exp << '\t';

            bool first = true;
            for (const auto& connectedEmail : user.connectedUsers) {
                if (!first) {
                    output << ',';
                }

                output << connectedEmail;
                first = false;
            }

            output << '\n';
        }
    }
};

struct Event {
    std::string id;
    std::string name;
    std::string description;
    std::string startDate;
    std::string endDate;
    std::string location;
    std::string type;
};

// Stores event records in a simple local text file.
// Format: id<TAB>name<TAB>description<TAB>start_date<TAB>end_date<TAB>location<TAB>type
class EventDatabase {
public:
    explicit EventDatabase(std::string filePath) : path(std::move(filePath)) {
        load();
    }

    bool addEvent(
        const std::string& rawId,
        const std::string& rawName,
        const std::string& rawDescription,
        const std::string& rawStartDate,
        const std::string& rawEndDate,
        const std::string& rawLocation,
        const std::string& rawType
    ) {
        const std::string id = cleanText(rawId);
        const std::string name = cleanText(rawName);
        const std::string description = cleanText(rawDescription);
        const std::string startDate = cleanText(rawStartDate);
        const std::string endDate = cleanText(rawEndDate);
        const std::string location = cleanText(rawLocation);
        const std::string type = normalizeType(rawType);

        if (id.empty()) {
            throw std::invalid_argument("Event id cannot be empty.");
        }

        if (name.empty()) {
            throw std::invalid_argument("Event name cannot be empty.");
        }

        if (description.empty()) {
            throw std::invalid_argument("Event description cannot be empty.");
        }

        if (!isValidDate(startDate)) {
            throw std::invalid_argument("Start date must use YYYY-MM-DD format.");
        }

        if (!isValidDate(endDate)) {
            throw std::invalid_argument("End date must use YYYY-MM-DD format.");
        }

        if (endDate < startDate) {
            throw std::invalid_argument("End date cannot be before start date.");
        }

        if (!isValidType(type)) {
            throw std::invalid_argument("Event type must be profesional or leisure.");
        }

        const Event event{id, name, description, startDate, endDate, location, type};
        const bool inserted = events.emplace(id, event).second;
        if (!inserted) {
            events[id] = event;
        }

        save();
        return inserted;
    }

    const Event& getEvent(const std::string& rawId) const {
        const std::string id = cleanText(rawId);
        const auto found = events.find(id);
        if (found == events.end()) {
            throw std::invalid_argument("No event found with id: " + id);
        }

        return found->second;
    }

    std::vector<Event> listEvents() const {
        std::vector<Event> result;
        for (const auto& [_, event] : events) {
            result.push_back(event);
        }
        return result;
    }

    std::size_t count() const {
        return events.size();
    }

private:
    std::string path;
    std::map<std::string, Event> events;

    static std::string cleanText(const std::string& value) {
        std::string cleaned = trim(value);

        std::replace(cleaned.begin(), cleaned.end(), '\t', ' ');
        std::replace(cleaned.begin(), cleaned.end(), '\n', ' ');
        std::replace(cleaned.begin(), cleaned.end(), '\r', ' ');

        return cleaned;
    }

    static std::string trim(const std::string& value) {
        const auto first = std::find_if_not(value.begin(), value.end(), [](unsigned char c) {
            return std::isspace(c);
        });

        const auto last = std::find_if_not(value.rbegin(), value.rend(), [](unsigned char c) {
            return std::isspace(c);
        }).base();

        if (first >= last) {
            return "";
        }

        return {first, last};
    }

    static std::string normalizeType(const std::string& value) {
        std::string type = trim(value);
        std::transform(type.begin(), type.end(), type.begin(), [](unsigned char c) {
            return static_cast<char>(std::tolower(c));
        });

        return type;
    }

    static bool isValidType(const std::string& type) {
        return type == "profesional" || type == "leisure";
    }

    static bool isValidDate(const std::string& date) {
        // This checks a simple YYYY-MM-DD shape. It is enough for hackathon data entry,
        // but it does not check month-specific day counts such as February 30.
        if (date.size() != 10 || date[4] != '-' || date[7] != '-') {
            return false;
        }

        for (std::size_t i = 0; i < date.size(); ++i) {
            if (i == 4 || i == 7) {
                continue;
            }

            if (!std::isdigit(static_cast<unsigned char>(date[i]))) {
                return false;
            }
        }

        const int month = std::stoi(date.substr(5, 2));
        const int day = std::stoi(date.substr(8, 2));

        return month >= 1 && month <= 12 && day >= 1 && day <= 31;
    }

    static std::vector<std::string> split(const std::string& value, char delimiter) {
        std::vector<std::string> parts;
        std::string current;

        for (const char c : value) {
            if (c == delimiter) {
                parts.push_back(current);
                current.clear();
            } else {
                current += c;
            }
        }

        parts.push_back(current);
        return parts;
    }

    void load() {
        std::ifstream input(path);
        std::string line;

        // Events saved by older versions without dates are ignored instead of crashing.
        while (std::getline(input, line)) {
            const std::vector<std::string> columns = split(line, '\t');
            if (columns.size() < 7) {
                continue;
            }

            const std::string id = cleanText(columns[0]);
            const std::string name = cleanText(columns[1]);
            const std::string description = cleanText(columns[2]);
            const std::string startDate = cleanText(columns[3]);
            const std::string endDate = cleanText(columns[4]);
            const std::string location = cleanText(columns[5]);
            const std::string type = normalizeType(columns[6]);

            if (!id.empty() &&
                !name.empty() &&
                !description.empty() &&
                isValidDate(startDate) &&
                isValidDate(endDate) &&
                endDate >= startDate &&
                isValidType(type)) {
                events[id] = Event{id, name, description, startDate, endDate, location, type};
            }
        }
    }

    void save() const {
        std::ofstream output(path, std::ios::trunc);
        if (!output) {
            throw std::runtime_error("Could not open event database for writing.");
        }

        for (const auto& [_, event] : events) {
            output << event.id << '\t'
                   << event.name << '\t'
                   << event.description << '\t'
                   << event.startDate << '\t'
                   << event.endDate << '\t'
                   << event.location << '\t'
                   << event.type << '\n';
        }
    }
};

void printUser(const User& user) {
    std::cout << user.name << " <" << user.email << "> | " << user.exp
              << " XP | level " << levelForExp(user.exp);

    if (user.connectedUsers.empty()) {
        std::cout << " | connected users: none\n";
        return;
    }

    std::cout << " | connected users: ";
    bool first = true;
    for (const auto& email : user.connectedUsers) {
        if (!first) {
            std::cout << ", ";
        }

        std::cout << email;
        first = false;
    }

    std::cout << '\n';
}

void printEvent(const Event& event) {
    std::cout << event.id << " | " << event.name
              << " | " << event.type
              << " | " << event.startDate << " to " << event.endDate
              << " | " << event.description;

    if (!event.location.empty()) {
        std::cout << " | location: " << event.location;
    }

    std::cout << '\n';
}

void printHelp() {
    std::cout << "Event app database\n"
              << "Usage:\n"
              << "  event_app add \"Name\" name@example.com\n"
              << "  event_app connect first@example.com second@example.com\n"
              << "  event_app show name@example.com\n"
              << "  event_app list\n"
              << "  event_app count\n"
              << "  event_app event-add event-id \"Name\" \"Description\" 2026-06-01 2026-06-01 \"Location\" profesional\n"
              << "  event_app event-add event-id \"Name\" \"Description\" 2026-06-01 2026-06-01 leisure\n"
              << "  event_app event-show event-id\n"
              << "  event_app event-list\n"
              << "  event_app event-count\n";
}

int main(int argc, char* argv[]) {
    UserDatabase userDatabase("users.db");
    EventDatabase eventDatabase("events.db");

    if (argc < 2) {
        printHelp();
        return 0;
    }

    const std::string command = argv[1];

    try {
        if (command == "add") {
            if (argc < 4) {
                std::cerr << "Please provide a name and an email address.\n";
                return 1;
            }

            const bool inserted = userDatabase.addUser(argv[2], argv[3]);
            std::cout << (inserted ? "User saved: " : "User updated: ") << argv[2] << " <" << argv[3] << ">\n";
            return 0;
        }

        if (command == "connect") {
            if (argc < 4) {
                std::cerr << "Please provide two user email addresses.\n";
                return 1;
            }

            const bool connected = userDatabase.connectUsers(argv[2], argv[3]);
            if (connected) {
                std::cout << "Users connected: " << argv[2] << " <-> " << argv[3]
                          << " (+" << UserDatabase::connectionExpReward << " XP each)\n";
            } else {
                std::cout << "Users were already connected: " << argv[2] << " <-> " << argv[3] << '\n';
            }
            return 0;
        }

        if (command == "show") {
            if (argc < 3) {
                std::cerr << "Please provide a user email address.\n";
                return 1;
            }

            printUser(userDatabase.getUser(argv[2]));
            return 0;
        }

        if (command == "list") {
            for (const auto& user : userDatabase.listUsers()) {
                printUser(user);
            }
            return 0;
        }

        if (command == "count") {
            std::cout << userDatabase.count() << '\n';
            return 0;
        }

        if (command == "event-add") {
            if (argc < 8) {
                std::cerr << "Please provide event id, name, description, start date, end date, and type.\n";
                return 1;
            }

            // Location is optional. If it is missing, the final argument is the event type.
            const std::string location = argc >= 9 ? argv[7] : "";
            const std::string type = argc >= 9 ? argv[8] : argv[7];
            const bool inserted = eventDatabase.addEvent(argv[2], argv[3], argv[4], argv[5], argv[6], location, type);
            std::cout << (inserted ? "Event saved: " : "Event updated: ") << argv[2] << " | " << argv[3] << '\n';
            return 0;
        }

        if (command == "event-show") {
            if (argc < 3) {
                std::cerr << "Please provide an event id.\n";
                return 1;
            }

            printEvent(eventDatabase.getEvent(argv[2]));
            return 0;
        }

        if (command == "event-list") {
            for (const auto& event : eventDatabase.listEvents()) {
                printEvent(event);
            }
            return 0;
        }

        if (command == "event-count") {
            std::cout << eventDatabase.count() << '\n';
            return 0;
        }

        printHelp();
        return 1;
    } catch (const std::exception& error) {
        std::cerr << "Error: " << error.what() << '\n';
        return 1;
    }
}
