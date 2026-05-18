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
    std::set<std::string> connectedUsers;
};

class UserDatabase {
public:
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

        const bool inserted = users.emplace(email, User{name, email, {}}).second;
        if (!inserted) {
            users[email].name = name;
        }

        save();
        return inserted;
    }

    void connectUsers(const std::string& firstEmail, const std::string& secondEmail) {
        const std::string first = normalizeEmail(firstEmail);
        const std::string second = normalizeEmail(secondEmail);

        if (first == second) {
            throw std::invalid_argument("A user cannot connect with themselves.");
        }

        requireUser(first);
        requireUser(second);

        users[first].connectedUsers.insert(second);
        users[second].connectedUsers.insert(first);
        save();
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
    std::map<std::string, User> users;

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

            User user{name, email, {}};
            if (columns.size() >= 3) {
                for (const auto& connectedEmail : split(columns[2], ',')) {
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
            output << user.email << '\t' << user.name << '\t';

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

void printUser(const User& user) {
    std::cout << user.name << " <" << user.email << ">";

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

void printHelp() {
    std::cout << "Event user database\n"
              << "Usage:\n"
              << "  event_app add \"Name\" name@example.com\n"
              << "  event_app connect first@example.com second@example.com\n"
              << "  event_app show name@example.com\n"
              << "  event_app list\n"
              << "  event_app count\n";
}

int main(int argc, char* argv[]) {
    UserDatabase database("users.db");

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

            const bool inserted = database.addUser(argv[2], argv[3]);
            std::cout << (inserted ? "User saved: " : "User updated: ") << argv[2] << " <" << argv[3] << ">\n";
            return 0;
        }

        if (command == "connect") {
            if (argc < 4) {
                std::cerr << "Please provide two user email addresses.\n";
                return 1;
            }

            database.connectUsers(argv[2], argv[3]);
            std::cout << "Users connected: " << argv[2] << " <-> " << argv[3] << '\n';
            return 0;
        }

        if (command == "show") {
            if (argc < 3) {
                std::cerr << "Please provide a user email address.\n";
                return 1;
            }

            printUser(database.getUser(argv[2]));
            return 0;
        }

        if (command == "list") {
            for (const auto& user : database.listUsers()) {
                printUser(user);
            }
            return 0;
        }

        if (command == "count") {
            std::cout << database.count() << '\n';
            return 0;
        }

        printHelp();
        return 1;
    } catch (const std::exception& error) {
        std::cerr << "Error: " << error.what() << '\n';
        return 1;
    }
}
