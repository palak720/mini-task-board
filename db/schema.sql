-- Mini Task Board schema + seed data
-- Run with: mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS mini_task_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_task_board;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  status ENUM('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tasks (title, status)
SELECT * FROM (
  SELECT 'Set up project repo' AS title, 'done' AS status
  UNION ALL SELECT 'Design tasks table schema', 'done'
  UNION ALL SELECT 'Build task list API', 'in-progress'
  UNION ALL SELECT 'Write README', 'todo'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM tasks);