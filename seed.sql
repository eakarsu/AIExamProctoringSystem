-- ============================================
-- AI Exam Proctoring System - Seed Data
-- Database: exam_proctoring
-- ============================================
-- This file only contains INSERT statements.
-- Tables are created by the backend server.js on startup.
-- ============================================

-- Clean existing data (preserve users and settings)
TRUNCATE TABLE browser_security_events, plagiarism_reports, audio_monitoring_logs, behavior_analysis_logs, face_verification_logs, exam_results, incidents, proctoring_sessions, proctors, students, exams, institutions CASCADE;

-- Reset sequences
ALTER SEQUENCE institutions_id_seq RESTART WITH 1;
ALTER SEQUENCE exams_id_seq RESTART WITH 1;
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE proctors_id_seq RESTART WITH 1;
ALTER SEQUENCE proctoring_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE incidents_id_seq RESTART WITH 1;
ALTER SEQUENCE exam_results_id_seq RESTART WITH 1;
ALTER SEQUENCE face_verification_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE behavior_analysis_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE audio_monitoring_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE plagiarism_reports_id_seq RESTART WITH 1;
ALTER SEQUENCE browser_security_events_id_seq RESTART WITH 1;

-- ============================================
-- INSTITUTIONS (15 rows)
-- ============================================
INSERT INTO institutions (name, type, address, city, state, country, email, phone, license_type, status) VALUES
('Massachusetts Institute of Technology', 'university', '77 Massachusetts Ave', 'Cambridge', 'Massachusetts', 'USA', 'admissions@mit.edu', '+1-617-253-1000', 'enterprise', 'active'),
('Stanford University', 'university', '450 Serra Mall', 'Stanford', 'California', 'USA', 'contact@stanford.edu', '+1-650-723-2300', 'enterprise', 'active'),
('Oxford University', 'university', 'Wellington Square', 'Oxford', 'Oxfordshire', 'UK', 'info@ox.ac.uk', '+44-1865-270000', 'enterprise', 'active'),
('Harvard University', 'university', 'Massachusetts Hall', 'Cambridge', 'Massachusetts', 'USA', 'admissions@harvard.edu', '+1-617-495-1000', 'enterprise', 'active'),
('California Institute of Technology', 'university', '1200 E California Blvd', 'Pasadena', 'California', 'USA', 'info@caltech.edu', '+1-626-395-6811', 'professional', 'active'),
('Imperial College London', 'university', 'Exhibition Road', 'London', 'England', 'UK', 'info@imperial.ac.uk', '+44-20-7589-5111', 'professional', 'active'),
('ETH Zurich', 'university', 'Raemistrasse 101', 'Zurich', 'Zurich', 'Switzerland', 'info@ethz.ch', '+41-44-632-1111', 'professional', 'active'),
('National University of Singapore', 'university', '21 Lower Kent Ridge Rd', 'Singapore', 'Central', 'Singapore', 'contact@nus.edu.sg', '+65-6516-6666', 'professional', 'active'),
('Community College of Denver', 'college', '1111 W Colfax Ave', 'Denver', 'Colorado', 'USA', 'info@ccd.edu', '+1-303-556-2600', 'basic', 'active'),
('Toronto Metropolitan University', 'university', '350 Victoria St', 'Toronto', 'Ontario', 'Canada', 'info@torontomu.ca', '+1-416-979-5000', 'professional', 'active'),
('Google Learning Center', 'corporate', '1600 Amphitheatre Pkwy', 'Mountain View', 'California', 'USA', 'learning@google.com', '+1-650-253-0000', 'enterprise', 'active'),
('Amazon Web Services Training', 'corporate', '410 Terry Ave N', 'Seattle', 'Washington', 'USA', 'training@aws.amazon.com', '+1-206-266-1000', 'enterprise', 'active'),
('Westfield High School', 'school', '4700 Stonecroft Blvd', 'Chantilly', 'Virginia', 'USA', 'office@westfieldhs.edu', '+1-703-488-6000', 'basic', 'active'),
('Technical University of Munich', 'university', 'Arcisstrasse 21', 'Munich', 'Bavaria', 'Germany', 'info@tum.de', '+49-89-289-01', 'professional', 'active'),
('University of Tokyo', 'university', '7-3-1 Hongo, Bunkyo', 'Tokyo', 'Kanto', 'Japan', 'info@u-tokyo.ac.jp', '+81-3-3812-2111', 'enterprise', 'inactive');

-- ============================================
-- EXAMS (15 rows)
-- ============================================
INSERT INTO exams (title, description, subject, duration_minutes, total_marks, passing_marks, status, institution_id) VALUES
('Advanced Calculus Final', 'Comprehensive final exam covering multivariable calculus, differential equations, and series convergence.', 'Mathematics', 180, 100, 60, 'active', 1),
('Data Structures Midterm', 'Midterm examination on arrays, linked lists, trees, graphs, and sorting algorithms.', 'Computer Science', 120, 80, 48, 'active', 2),
('Organic Chemistry Lab Practical', 'Practical assessment of organic synthesis techniques and spectroscopic analysis.', 'Chemistry', 150, 100, 55, 'active', 3),
('Macroeconomics Final Exam', 'Final exam covering GDP, inflation, monetary policy, and international trade.', 'Economics', 120, 100, 50, 'completed', 4),
('Introduction to Machine Learning', 'Assessment on supervised learning, neural networks, and model evaluation techniques.', 'Computer Science', 90, 75, 45, 'active', 5),
('Quantum Mechanics Midterm', 'Midterm covering wave functions, Schrodinger equation, and quantum operators.', 'Physics', 120, 100, 60, 'active', 6),
('Molecular Biology Assessment', 'Examination on DNA replication, transcription, translation, and gene regulation.', 'Biology', 90, 80, 48, 'active', 7),
('Cloud Architecture Certification', 'Professional certification exam for cloud solution architects.', 'Information Technology', 180, 100, 72, 'active', 11),
('Constitutional Law Final', 'Final examination covering constitutional amendments, judicial review, and civil liberties.', 'Law', 150, 100, 65, 'active', 4),
('Statistics and Probability', 'Comprehensive exam on probability distributions, hypothesis testing, and regression analysis.', 'Mathematics', 120, 100, 55, 'active', 1),
('Software Engineering Principles', 'Assessment on SDLC, design patterns, testing methodologies, and agile practices.', 'Computer Science', 90, 80, 48, 'draft', 2),
('Thermodynamics Final', 'Final exam covering laws of thermodynamics, entropy, and heat transfer.', 'Engineering', 120, 100, 60, 'active', 14),
('AWS Solutions Architect Practice', 'Practice certification exam for AWS Solutions Architect Associate level.', 'Information Technology', 130, 65, 46, 'active', 12),
('AP Calculus BC', 'Advanced Placement Calculus BC examination for high school students.', 'Mathematics', 195, 108, 65, 'active', 13),
('Medical Ethics Examination', 'Assessment on bioethics, patient autonomy, informed consent, and end-of-life care.', 'Medical Sciences', 90, 100, 70, 'completed', 8);

-- ============================================
-- STUDENTS (15 rows)
-- ============================================
INSERT INTO students (first_name, last_name, email, student_id, institution_id, phone, status) VALUES
('Emily', 'Chen', 'emily.chen@mit.edu', 'STU-001', 1, '+1-617-555-0101', 'active'),
('James', 'Rodriguez', 'james.rodriguez@stanford.edu', 'STU-002', 2, '+1-650-555-0102', 'active'),
('Sarah', 'Williams', 'sarah.williams@ox.ac.uk', 'STU-003', 3, '+44-7700-900103', 'active'),
('Michael', 'Johnson', 'michael.johnson@harvard.edu', 'STU-004', 4, '+1-617-555-0104', 'active'),
('Priya', 'Patel', 'priya.patel@caltech.edu', 'STU-005', 5, '+1-626-555-0105', 'active'),
('David', 'Kim', 'david.kim@imperial.ac.uk', 'STU-006', 6, '+44-7700-900106', 'active'),
('Anna', 'Mueller', 'anna.mueller@ethz.ch', 'STU-007', 7, '+41-79-555-0107', 'active'),
('Wei', 'Zhang', 'wei.zhang@nus.edu.sg', 'STU-008', 8, '+65-9123-0108', 'active'),
('Carlos', 'Mendoza', 'carlos.mendoza@ccd.edu', 'STU-009', 9, '+1-303-555-0109', 'active'),
('Olivia', 'Thompson', 'olivia.thompson@torontomu.ca', 'STU-010', 10, '+1-416-555-0110', 'active'),
('Ahmed', 'Hassan', 'ahmed.hassan@mit.edu', 'STU-011', 1, '+1-617-555-0111', 'active'),
('Jessica', 'Brown', 'jessica.brown@stanford.edu', 'STU-012', 2, '+1-650-555-0112', 'suspended'),
('Takeshi', 'Yamamoto', 'takeshi.yamamoto@u-tokyo.ac.jp', 'STU-013', 15, '+81-90-5550-0113', 'active'),
('Sophie', 'Dubois', 'sophie.dubois@tum.de', 'STU-014', 14, '+49-170-555-0114', 'active'),
('Robert', 'Taylor', 'robert.taylor@harvard.edu', 'STU-015', 4, '+1-617-555-0115', 'graduated');

-- ============================================
-- PROCTORS (15 rows)
-- ============================================
INSERT INTO proctors (first_name, last_name, email, phone, specialization, experience_years, status, certification, institution_id) VALUES
('Dr. Richard', 'Hayes', 'richard.hayes@mit.edu', '+1-617-555-0201', 'Computer Science', 12, 'active', 'Certified Online Proctor (COP)', 1),
('Dr. Maria', 'Garcia', 'maria.garcia@stanford.edu', '+1-650-555-0202', 'Mathematics', 8, 'active', 'ProctorU Certified', 2),
('Prof. William', 'Clark', 'william.clark@ox.ac.uk', '+44-7700-900203', 'Sciences', 15, 'active', 'British Council Examiner', 3),
('Dr. Susan', 'Lee', 'susan.lee@harvard.edu', '+1-617-555-0204', 'Economics', 10, 'active', 'Certified Online Proctor (COP)', 4),
('Dr. Thomas', 'Anderson', 'thomas.anderson@caltech.edu', '+1-626-555-0205', 'Engineering', 7, 'active', 'Examity Certified Proctor', 5),
('Dr. Helen', 'Wright', 'helen.wright@imperial.ac.uk', '+44-7700-900206', 'Medical', 14, 'active', 'GMC Registered Examiner', 6),
('Prof. Klaus', 'Schneider', 'klaus.schneider@ethz.ch', '+41-79-555-0207', 'Engineering', 20, 'active', 'Swiss Examination Board', 7),
('Dr. Li', 'Wang', 'li.wang@nus.edu.sg', '+65-9123-0208', 'Computer Science', 6, 'active', 'ProctorU Certified', 8),
('Jennifer', 'Martinez', 'jennifer.martinez@ccd.edu', '+1-303-555-0209', 'General Studies', 4, 'active', 'College Board Proctor', 9),
('Dr. Andrew', 'Fraser', 'andrew.fraser@torontomu.ca', '+1-416-555-0210', 'Sciences', 9, 'active', 'Canadian Proctor Certification', 10),
('Mark', 'Robinson', 'mark.robinson@google.com', '+1-650-555-0211', 'Information Technology', 5, 'active', 'Google Certified Trainer', 11),
('Sandra', 'Hughes', 'sandra.hughes@aws.amazon.com', '+1-206-555-0212', 'Information Technology', 6, 'active', 'AWS Training Partner', 12),
('Patricia', 'Davis', 'patricia.davis@westfieldhs.edu', '+1-703-555-0213', 'Mathematics', 3, 'active', 'State Board Certified', 13),
('Prof. Hans', 'Weber', 'hans.weber@tum.de', '+49-170-555-0214', 'Engineering', 18, 'active', 'TUV Certified Examiner', 14),
('Dr. Yuki', 'Tanaka', 'yuki.tanaka@u-tokyo.ac.jp', '+81-90-5550-0215', 'Sciences', 11, 'inactive', 'MEXT Certified', 15);

-- ============================================
-- PROCTORING SESSIONS (15 rows)
-- ============================================
INSERT INTO proctoring_sessions (exam_id, student_id, proctor_id, start_time, end_time, status, trust_score, browser_locked, webcam_enabled, audio_enabled, notes) VALUES
(1, 1, 1, '2024-03-15 09:00:00', '2024-03-15 12:00:00', 'completed', 95.50, true, true, true, 'Smooth session, no incidents reported.'),
(2, 2, 2, '2024-03-16 10:00:00', '2024-03-16 12:00:00', 'completed', 88.00, true, true, true, 'Minor tab switch detected at 10:45, student refocused immediately.'),
(3, 3, 3, '2024-03-17 14:00:00', '2024-03-17 16:30:00', 'completed', 72.30, true, true, true, 'Multiple face detection alerts. Second person briefly visible in background.'),
(4, 4, 4, '2024-03-18 09:00:00', '2024-03-18 11:00:00', 'completed', 98.00, true, true, true, 'Excellent session. Student fully compliant throughout.'),
(5, 5, 5, '2024-03-20 13:00:00', '2024-03-20 14:30:00', 'completed', 65.00, true, true, true, 'Flagged for review. Audio anomaly detected and suspicious eye movement patterns.'),
(6, 6, 6, '2024-04-01 10:00:00', '2024-04-01 12:00:00', 'completed', 91.20, true, true, true, 'One brief webcam obstruction at 11:15. Otherwise clean session.'),
(7, 7, 7, '2024-04-05 08:00:00', '2024-04-05 09:30:00', 'completed', 45.00, true, true, true, 'Session flagged. Multiple violations including tab switches and audio anomalies.'),
(8, 8, 8, '2024-04-10 15:00:00', '2024-04-10 18:00:00', 'completed', 99.00, true, true, true, 'Perfect session. Full compliance with all proctoring requirements.'),
(1, 11, 1, '2024-04-15 09:00:00', NULL, 'in_progress', 87.50, true, true, true, 'Session currently active. Minor gaze deviation noted.'),
(2, 12, 2, '2024-04-15 10:00:00', NULL, 'in_progress', 92.00, true, true, true, 'Session in progress. No issues so far.'),
(10, 9, 9, '2024-04-20 11:00:00', NULL, 'scheduled', 100.00, true, true, true, 'Upcoming session scheduled.'),
(12, 14, 14, '2024-04-22 09:00:00', NULL, 'scheduled', 100.00, true, true, true, 'Scheduled for next week.'),
(5, 10, 10, '2024-03-25 14:00:00', '2024-03-25 15:30:00', 'flagged', 38.50, true, true, true, 'Critical: Identity mismatch detected. Escalated for investigation.'),
(9, 15, 4, '2024-03-28 09:00:00', '2024-03-28 11:30:00', 'completed', 82.00, true, true, false, 'Audio monitoring was disabled per student accessibility request.'),
(13, 8, 12, '2024-04-12 10:00:00', NULL, 'cancelled', 0.00, false, false, false, 'Session cancelled due to technical difficulties on the student end.');

-- ============================================
-- INCIDENTS (15 rows)
-- ============================================
INSERT INTO incidents (session_id, type, severity, description, ai_confidence, status, resolution_notes) VALUES
(2, 'tab_switch', 'low', 'Student switched to a different browser tab for approximately 3 seconds before returning to the exam window.', 0.9500, 'resolved', 'Reviewed recording. Student accidentally clicked notification. No evidence of cheating.'),
(3, 'multiple_faces', 'high', 'A second face was detected in the webcam feed at 15:22. The additional person was visible for approximately 8 seconds.', 0.8800, 'reviewing', NULL),
(3, 'face_not_detected', 'medium', 'Primary face was not detected for 12 seconds during the session. Student appeared to lean out of frame.', 0.7200, 'resolved', 'Student was reaching for a permitted calculator. Confirmed via recording review.'),
(5, 'audio_anomaly', 'high', 'Background voice detected speaking in a conversational tone. Speech patterns suggest another person providing verbal assistance.', 0.8100, 'reviewing', NULL),
(5, 'face_not_detected', 'medium', 'Student face was not visible for 20 seconds. Camera angle shifted significantly during this time.', 0.9100, 'open', NULL),
(7, 'tab_switch', 'high', 'Student switched tabs 4 times within a 5-minute period. Each switch lasted between 5-15 seconds.', 0.9800, 'resolved', 'Confirmed violation. Student was accessing unauthorized reference material. Exam invalidated.'),
(7, 'audio_anomaly', 'critical', 'Continuous whispering detected for 2 minutes. AI analysis indicates the student was reading questions aloud and receiving whispered responses.', 0.8700, 'resolved', 'Confirmed via audio analysis. Case referred to academic integrity board.'),
(7, 'unauthorized_device', 'critical', 'A mobile phone screen reflection was detected in the student glasses. Device appeared to display text content.', 0.7600, 'resolved', 'Confirmed unauthorized device use. Exam invalidated and disciplinary action initiated.'),
(9, 'face_not_detected', 'low', 'Brief face detection loss for 2 seconds. Student was adjusting webcam position.', 0.6500, 'dismissed', 'False positive. Student was adjusting their setup.'),
(10, 'tab_switch', 'low', 'Single tab switch detected. Student returned within 1 second.', 0.9200, 'dismissed', 'Accidental switch. No concern.'),
(13, 'identity_mismatch', 'critical', 'Face verification indicates the person taking the exam does not match the registered student profile photo. Confidence of mismatch: 94%.', 0.9400, 'open', NULL),
(13, 'plagiarism_detected', 'high', 'Student answer to question 7 shows 92% similarity with content from an external database. Text structure and phrasing are nearly identical.', 0.8900, 'reviewing', NULL),
(6, 'screen_share', 'medium', 'Brief screen sharing activity detected. A secondary display connection event was logged.', 0.7800, 'resolved', 'Student had a monitor connected but was not using it. Instructed to disconnect and session continued.'),
(14, 'tab_switch', 'low', 'Two tab switches detected during the session. Brief and non-suspicious pattern.', 0.8500, 'resolved', 'Normal browser behavior. No further action required.'),
(3, 'audio_anomaly', 'medium', 'Background noise detected including what appears to be a television or radio playing in the same room.', 0.7000, 'resolved', 'Student was asked to mute background audio. Complied immediately.');

-- ============================================
-- EXAM RESULTS (15 rows)
-- ============================================
INSERT INTO exam_results (session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count, status, completed_at) VALUES
(1, 1, 1, 87.00, 100, 87.00, 'A', 95.50, 0, 'passed', '2024-03-15 12:00:00'),
(2, 2, 2, 72.00, 80, 90.00, 'A', 88.00, 1, 'passed', '2024-03-16 12:00:00'),
(3, 3, 3, 61.00, 100, 61.00, 'C', 72.30, 3, 'under_review', '2024-03-17 16:30:00'),
(4, 4, 4, 92.00, 100, 92.00, 'A', 98.00, 0, 'passed', '2024-03-18 11:00:00'),
(5, 5, 5, 55.00, 75, 73.33, 'B', 65.00, 2, 'under_review', '2024-03-20 14:30:00'),
(6, 6, 6, 78.00, 100, 78.00, 'B', 91.20, 1, 'passed', '2024-04-01 12:00:00'),
(7, 7, 7, 45.00, 80, 56.25, 'D', 45.00, 3, 'invalidated', '2024-04-05 09:30:00'),
(8, 8, 8, 95.00, 100, 95.00, 'A', 99.00, 0, 'passed', '2024-04-10 18:00:00'),
(13, 5, 10, 38.00, 75, 50.67, 'D', 38.50, 2, 'invalidated', '2024-03-25 15:30:00'),
(14, 9, 15, 71.00, 100, 71.00, 'B', 82.00, 1, 'passed', '2024-03-28 11:30:00'),
(1, 1, 1, 91.00, 100, 91.00, 'A', 97.00, 0, 'passed', '2024-04-01 12:00:00'),
(4, 4, 4, 48.00, 100, 48.00, 'F', 96.00, 0, 'failed', '2024-03-20 11:00:00'),
(6, 6, 6, 83.00, 100, 83.00, 'A', 93.50, 0, 'passed', '2024-04-15 12:00:00'),
(8, 8, 8, 68.00, 100, 68.00, 'C', 98.50, 0, 'passed', '2024-04-20 18:00:00'),
(14, 9, 15, 64.50, 100, 64.50, 'C', 85.00, 1, 'passed', '2024-04-10 11:30:00');

-- ============================================
-- FACE VERIFICATION LOGS (15 rows)
-- ============================================
INSERT INTO face_verification_logs (session_id, analysis, confidence, risk_level, recommendations) VALUES
(1, 'Face verification completed successfully. The student identity matches the registered profile photo with high confidence. Facial landmarks are consistent, lighting conditions are adequate, and no anomalies were detected during the verification process.', 0.9700, 'low', 'No action required. Identity verified successfully.'),
(2, 'Face verification passed. Student identity confirmed. Minor lighting variation noted on the left side of the face but facial geometry matches the profile within acceptable parameters.', 0.9200, 'low', 'Consider asking student to adjust lighting for optimal monitoring.'),
(3, 'Face verification flagged. While the primary face matches the registered student, a second face was intermittently detected in the background. The secondary face appeared at timestamps 15:22 and 15:45.', 0.7800, 'high', 'Recommend manual review of the session recording. Consider contacting the student for clarification about the second person.'),
(4, 'Face verification completed with full confidence. Clear frontal face detected throughout the session. Excellent lighting conditions and webcam positioning.', 0.9900, 'low', 'No action required. Exemplary verification conditions.'),
(5, 'Face verification shows intermittent anomalies. Student face was detected for 94% of the session duration. During face-absent periods, camera appeared to be partially obstructed or student moved out of frame.', 0.8100, 'medium', 'Review face-absent timestamps. Consider reducing the acceptable absence threshold for this student in future sessions.'),
(6, 'Face verification passed with a brief interruption at 11:15. The webcam was temporarily obstructed for 4 seconds. Identity was re-confirmed immediately after obstruction cleared.', 0.9100, 'low', 'Minor webcam obstruction detected but identity maintained. No further action needed.'),
(7, 'Face verification shows significant concerns. Multiple periods where the detected face did not match expected facial geometry. Possible use of a photo or screen display to simulate presence detected at 08:32.', 0.6500, 'high', 'Immediate manual review required. Potential identity fraud indicators present. Recommend session invalidation pending investigation.'),
(8, 'Face verification excellent throughout entire 3-hour session. Continuous face detection with consistent identity match. No anomalies, obstructions, or secondary faces detected at any point.', 0.9900, 'low', 'Perfect verification session. No action required.'),
(9, 'Face verification in progress. Initial identity match confirmed. Student face detected with good clarity. Minor gaze deviation patterns noted but within acceptable range for exam-taking behavior.', 0.8800, 'low', 'Continue monitoring. Current gaze patterns are normal for an active exam session.'),
(10, 'Face verification active. Student identity confirmed at session start. Consistent face detection maintained. No anomalies detected so far in the ongoing session.', 0.9300, 'low', 'Session proceeding normally. No intervention needed.'),
(13, 'CRITICAL: Face verification failed. The person currently taking the exam does not match the registered student profile. Facial geometry comparison shows a 94% mismatch probability. This appears to be a different individual.', 0.9400, 'high', 'Immediately flag this session. Contact the institution coordinator. This is a potential impersonation case requiring urgent investigation.'),
(14, 'Face verification completed. Student identity confirmed. Audio monitoring was disabled for this session per accessibility accommodation, but visual verification was maintained throughout.', 0.8700, 'low', 'Identity verified. Note the audio monitoring exemption for record-keeping.'),
(3, 'Follow-up face verification analysis. Background person identified as likely a family member passing through the room. The primary student face remained consistent with profile throughout.', 0.8500, 'medium', 'While the primary identity is verified, recommend the student ensure a private testing environment for future exams.'),
(5, 'Secondary face verification analysis during flagged periods. Student appears to have been looking away from screen frequently, possibly at notes or a secondary device below the camera field of view.', 0.7600, 'medium', 'Recommend reviewing the full session recording with particular attention to the student hand and desk area.'),
(7, 'Final face verification assessment. Combined analysis of all facial data indicates a high probability that an unauthorized person was present or the student used a surrogate for portions of the examination.', 0.7100, 'high', 'Case escalated to academic integrity office. Full evidence package compiled including timestamped facial analysis data.');

-- ============================================
-- BEHAVIOR ANALYSIS LOGS (15 rows)
-- ============================================
INSERT INTO behavior_analysis_logs (session_id, analysis, confidence, risk_level, recommendations) VALUES
(1, 'Behavioral analysis indicates normal exam-taking patterns. The student maintained consistent focus on the exam content. Mouse movements and keystrokes are consistent with reading and answering questions. No erratic behavior patterns detected.', 0.9500, 'low', 'No concerns. Student exhibited typical focused exam behavior throughout the session.'),
(2, 'Behavior mostly normal with one anomaly. At 10:45, the student abruptly moved focus away from the exam window for 3 seconds. This coincides with a tab-switch event. Remaining behavior is consistent with normal exam engagement.', 0.8800, 'low', 'The single tab switch appears incidental. No pattern of suspicious behavior. Continue standard monitoring.'),
(3, 'Behavior analysis shows moderate concern. Student exhibited frequent head movements toward a position off-screen left. Eye tracking suggests attention was divided between the exam screen and another point of interest approximately 11 times during the session.', 0.7900, 'medium', 'Review session recording for potential unauthorized materials placed off-screen. Consider requiring a room scan in future sessions.'),
(4, 'Exemplary exam behavior. Student demonstrated consistent reading patterns, thoughtful pauses before answering, and methodical progression through questions. No suspicious movements or attention diversions detected.', 0.9800, 'low', 'No action needed. This session can be used as a reference example for normal behavior patterns.'),
(5, 'Behavior analysis flagged multiple concerns. Student showed agitated movement patterns, frequent camera avoidance, and irregular typing cadence. At 13:42, there was a 20-second period of no keyboard or mouse activity followed by rapid text entry suggesting possible copy-paste behavior.', 0.8200, 'high', 'Manual review strongly recommended. The behavioral pattern is consistent with receiving external assistance. Compare answer timestamps with input patterns.'),
(6, 'Normal behavior with one brief interruption. Student appeared to reach for something off-screen at 11:15 for 4 seconds. Before and after this event, behavior was consistent with focused exam-taking.', 0.9000, 'low', 'Minor interruption noted. No pattern of concern. Normal exam behavior otherwise.'),
(7, 'CRITICAL: Behavioral analysis detected high-risk patterns throughout the session. Student exhibited repeated screen-avoidance behavior, consistent eye movement toward a fixed off-screen point, and typing patterns that suggest dictation rather than independent composition.', 0.8500, 'high', 'Immediate review required. Multiple behavioral indicators suggest unauthorized assistance. Recommend cross-referencing with audio analysis and face verification data.'),
(8, 'Outstanding behavioral compliance. Student maintained perfect posture, consistent screen focus, and natural typing patterns for the entire 3-hour session. Engagement metrics indicate deep focus and independent problem-solving behavior.', 0.9900, 'low', 'Excellent session. Student demonstrated ideal exam-taking behavior. No concerns whatsoever.'),
(9, 'Behavior analysis in progress for active session. Current patterns show normal exam engagement. Student is reading questions carefully and typing responses at a natural pace. Minor gaze deviations detected but within normal range.', 0.8700, 'low', 'Ongoing monitoring. Current behavior is within acceptable parameters. No intervention needed at this time.'),
(10, 'Active session behavior analysis. Student is demonstrating normal exam-taking patterns. Consistent focus on screen content with natural breaks between questions.', 0.9100, 'low', 'Session proceeding normally. Standard monitoring sufficient.'),
(13, 'CRITICAL: Behavioral patterns are highly inconsistent with the registered student previous exam sessions. Typing cadence, mouse movement patterns, and response timing differ significantly from the established behavioral profile.', 0.9200, 'high', 'Combined with face verification mismatch, this strongly suggests an impersonation scenario. Escalate immediately to institution security.'),
(14, 'Normal behavior throughout session. Student worked methodically through the exam questions. Accessibility accommodation noted: student used screen reader, which accounts for unusual gaze patterns detected by standard monitoring.', 0.8400, 'low', 'Behavioral patterns are consistent with screen reader usage. No concerns after accounting for accessibility tools.'),
(2, 'Follow-up behavioral analysis. The tab-switch event was an isolated incident. Overall session behavior score is 92/100, indicating strong compliance with exam protocols.', 0.9300, 'low', 'No further action required. Session approved.'),
(5, 'Deep behavioral analysis of flagged periods. The rapid text entry at 13:42 was analyzed against the student typical typing patterns. The entry speed was 340% above the student baseline, strongly suggesting external text input.', 0.8800, 'high', 'Evidence supports external text source. Recommend comparing submitted answers against known databases and conducting a follow-up interview with the student.'),
(6, 'Comprehensive behavior summary. Session scored 95/100 on behavioral compliance. The single webcam obstruction event did not correlate with any suspicious input or behavioral patterns.', 0.9400, 'low', 'Session approved. High confidence in exam integrity.');

-- ============================================
-- AUDIO MONITORING LOGS (15 rows)
-- ============================================
INSERT INTO audio_monitoring_logs (session_id, analysis, confidence, risk_level, recommendations) VALUES
(1, 'Audio monitoring detected minimal background noise consistent with a quiet indoor environment. No speech or voices detected throughout the session. Ambient noise levels remained below 30 dB throughout.', 0.9600, 'low', 'Ideal audio environment. No concerns detected.'),
(2, 'Audio environment was generally quiet. At 10:43, a brief notification sound was detected from the student device, likely a system notification. No speech or unauthorized audio sources identified.', 0.9100, 'low', 'Recommend student disable all notifications before future exams. No integrity concerns.'),
(3, 'Audio analysis detected intermittent background conversation at low volume. The conversation appears to be from an adjacent room or hallway. Content analysis could not determine if the speech was directed at the student.', 0.7500, 'medium', 'Recommend the student secure a more isolated testing environment. Background speech should be investigated if combined with other suspicious indicators.'),
(4, 'Silent testing environment confirmed. Audio monitoring detected only keyboard typing and occasional mouse clicks. No speech, music, or other audio sources identified during the 2-hour session.', 0.9800, 'low', 'Perfect audio environment. No action required.'),
(5, 'ALERT: Audio analysis detected a secondary voice at 13:38. The voice appears to be speaking in a low tone, with speech patterns suggesting directive communication such as reading content or providing instructions. Duration: approximately 45 seconds.', 0.8300, 'high', 'Critical finding. Secondary voice detected in close proximity to student. Manual audio review required. Consider this alongside face and behavior analysis findings.'),
(6, 'Audio monitoring normal. Background noise consistent with indoor environment. Brief rustling sound at 11:15 coincides with the webcam obstruction event. No speech detected.', 0.9200, 'low', 'Audio confirms the webcam obstruction was likely the student reaching for an object. No concerns.'),
(7, 'CRITICAL: Audio analysis detected sustained whispering at multiple intervals throughout the session. At 08:25, 08:32, 08:47, and 09:05, distinct whispering was captured. Speech recognition analysis suggests questions were being read aloud and responses received.', 0.8700, 'high', 'Urgent manual review needed. Audio evidence strongly supports external verbal assistance. Combine with behavioral analysis for comprehensive assessment.'),
(8, 'Excellent audio environment throughout the 3-hour session. Only typing and mouse sounds detected. No speech, background noise, or audio anomalies. The testing environment meets all recommended standards for remote proctoring.', 0.9900, 'low', 'Perfect audio monitoring session. No action needed.'),
(9, 'Active session audio monitoring. Current audio levels are normal. Ambient noise is within acceptable range. No speech detected so far. Continuous monitoring in progress.', 0.8800, 'low', 'Audio environment is satisfactory for the ongoing session.'),
(10, 'Active session audio monitoring in progress. Clean audio environment with no anomalies detected. Student typing sounds detected at normal intervals.', 0.9300, 'low', 'Continue standard audio monitoring.'),
(13, 'Audio analysis of flagged session. While no direct speech was captured, ambient noise patterns differ significantly from the registered student previous sessions, suggesting a different physical location than expected.', 0.7800, 'medium', 'Cross-reference location data with audio environmental fingerprint. This supports the identity mismatch findings from face verification.'),
(14, 'Audio monitoring was disabled for this session per documented accessibility accommodation. Screen reader audio output was permitted. No monitoring data collected.', 0.5000, 'low', 'Audio monitoring exemption was properly documented. Visual and behavioral monitoring remained active throughout.'),
(3, 'Follow-up audio analysis. Enhanced processing of the background conversation indicates it was a television or radio program rather than directed communication. Content analysis suggests a news broadcast.', 0.8200, 'low', 'Downgraded from medium to low risk. Background audio was from media, not directed assistance. Student should still minimize background noise.'),
(5, 'Enhanced audio analysis of the 13:38 incident. Voice print analysis confirms the secondary voice belongs to a different individual than the student. The speech content included mathematical terminology consistent with the exam subject matter.', 0.8600, 'high', 'Strong evidence of verbal assistance from a third party. This audio evidence should be preserved and included in the academic integrity investigation.'),
(7, 'Comprehensive audio summary. Total suspicious audio events: 7. Total duration of detected whispering: 4 minutes 22 seconds. Voice analysis confirms at least one additional person was present and communicating with the student throughout the exam.', 0.9000, 'high', 'Audio evidence compiled for disciplinary proceedings. Session audio preserved in secure evidence storage.');

-- ============================================
-- PLAGIARISM REPORTS (15 rows)
-- ============================================
INSERT INTO plagiarism_reports (student_answer, original_text, analysis, similarity_score, confidence, risk_level, recommendations) VALUES
('The mitochondria is the powerhouse of the cell, responsible for producing ATP through cellular respiration. This process involves glycolysis, the Krebs cycle, and oxidative phosphorylation.', 'The mitochondria is known as the powerhouse of the cell. It is responsible for generating ATP through the process of cellular respiration, which includes glycolysis, the citric acid cycle (Krebs cycle), and oxidative phosphorylation.', 'Moderate similarity detected. The student answer closely paraphrases a common textbook definition. While the core concepts are standard biological knowledge, the sentence structure and terminology sequence closely mirror the source material.', 0.7200, 0.8500, 'medium', 'This level of similarity is common for factual biology definitions. No action recommended unless combined with other plagiarism indicators.'),
('Machine learning algorithms can be categorized into three main types: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled data to train models.', 'Machine learning is typically categorized into three types: supervised learning, unsupervised learning, and reinforcement learning. In supervised learning, the algorithm is trained using labeled data.', 'High conceptual overlap but the phrasing differences suggest independent writing of a well-known classification. The student demonstrates understanding of the material rather than verbatim copying.', 0.6500, 0.8000, 'low', 'Similarity is within acceptable range for technical definitions. No plagiarism concern.'),
('According to Keynesian economics, government intervention through fiscal policy can stabilize economic cycles. During recessions, increased government spending and tax cuts can stimulate aggregate demand and promote economic recovery.', 'Keynesian economics advocates for government intervention through fiscal policy to stabilize economic cycles. During periods of recession, Keynes argued that increased government spending and reduced taxation can stimulate aggregate demand and facilitate economic recovery.', 'Significant textual similarity detected at 89%. The student response closely mirrors academic source material with minimal rephrasing. Sentence structure and argument flow are nearly identical to the original text.', 0.8900, 0.9200, 'high', 'High plagiarism probability. Recommend manual comparison with course materials and standard references. Consider requesting the student to explain their answer verbally.'),
('The Second Law of Thermodynamics states that entropy in an isolated system always increases over time. This means natural processes tend toward disorder and the total entropy of the universe is constantly growing.', 'In thermodynamics, the second law states that the entropy of an isolated system tends to increase over time. Natural processes are characterized by increasing disorder, and the total entropy of the universe increases continuously.', 'Strong similarity in content and structure. However, this is a fundamental physics principle commonly expressed in similar terms across most textbooks.', 0.7800, 0.8300, 'medium', 'While similarity is notable, the Second Law of Thermodynamics has limited ways of being expressed. Consider this a borderline case that should be evaluated in the context of other answers.'),
('DNA replication is a semiconservative process where each strand of the double helix serves as a template for a new complementary strand. The enzyme helicase unwinds the double helix while DNA polymerase synthesizes the new strand.', 'DNA replication follows a semiconservative model, meaning each strand of the original double helix serves as a template for the synthesis of a new complementary strand. Helicase is the enzyme responsible for unwinding the double helix, and DNA polymerase catalyzes the synthesis of the new DNA strand.', 'High similarity detected at 85%. The answer follows the same logical structure and uses identical terminology. While these are standard molecular biology terms, the sequential presentation suggests source dependency.', 0.8500, 0.8700, 'high', 'Recommend reviewing against the assigned textbook and lecture notes. If the student can demonstrate understanding in a different format, the concern may be mitigated.'),
('The French Revolution began in 1789 with the storming of the Bastille. It was driven by widespread discontent with the monarchy, economic inequality, and Enlightenment ideals of liberty and equality.', 'The French Revolution of 1789 started with the iconic storming of the Bastille. It was fueled by deep dissatisfaction with the absolute monarchy, severe economic inequality, and the spreading influence of Enlightenment ideals promoting liberty and equality.', 'Moderate similarity. Historical events have limited factual variations, but the student answer closely follows the source structure and emphasis.', 0.7100, 0.8100, 'medium', 'Acceptable for a history essay that relies on established facts. Monitor for patterns across multiple answers.'),
('SELECT * FROM employees WHERE department = Sales AND salary > 50000 ORDER BY last_name ASC;', 'SELECT * FROM employees WHERE department = ''Sales'' AND salary > 50000 ORDER BY last_name ASC;', 'Near-identical SQL query detected. The student query differs only in quote formatting around the Sales value. SQL queries for the same problem tend to have similar solutions, but this level of match warrants review.', 0.9500, 0.9000, 'high', 'SQL answers can legitimately be very similar. Check if this was a unique problem or a standard exercise. Compare with other students submissions for this question.'),
('Object-oriented programming is based on four main principles: encapsulation, inheritance, polymorphism, and abstraction. These concepts allow developers to create modular and reusable code structures.', 'The four fundamental principles of object-oriented programming are encapsulation, inheritance, polymorphism, and abstraction. Together, these principles enable developers to build modular, reusable, and maintainable software systems.', 'Standard OOP definition with expected overlap. The student has rephrased the concept adequately, though the structure remains similar to common reference material.', 0.6800, 0.7900, 'low', 'No plagiarism concern. This is a standard technical definition with limited variation in expression.'),
('Photosynthesis converts light energy into chemical energy stored in glucose molecules. The light-dependent reactions occur in the thylakoid membranes while the Calvin cycle takes place in the stroma of the chloroplast.', 'During photosynthesis, light energy is converted into chemical energy stored in glucose. The light-dependent reactions take place in the thylakoid membranes, and the Calvin cycle occurs in the stroma of the chloroplasts.', 'Very high similarity at 91%. The student answer is essentially a direct paraphrase with minimal word substitution. The factual content and sentence ordering are identical to the source.', 0.9100, 0.9300, 'high', 'Strong plagiarism indicator. The minimal rephrasing suggests the student copied and lightly modified the source. Recommend academic integrity review.'),
('The time complexity of quicksort is O(n log n) on average, but can degrade to O(n squared) in the worst case when the pivot selection is poor.', 'Quicksort has an average-case time complexity of O(n log n). However, in the worst case, particularly when the pivot element is poorly chosen, the complexity degrades to O(n^2).', 'Moderate similarity for a standard algorithm analysis answer. The mathematical concepts have limited ways of expression, and the student shows understanding of the material.', 0.6200, 0.7800, 'low', 'No concern. Algorithm complexity descriptions naturally have high similarity across independent answers.'),
('The supply and demand model predicts that when supply exceeds demand, prices will fall until equilibrium is reached. Conversely, when demand exceeds supply, prices rise to restore market balance.', 'According to the supply and demand model, when supply exceeds demand, prices decrease until market equilibrium is achieved. When demand exceeds supply, prices increase to restore the balance between supply and demand.', 'High structural similarity at 82%. While the economic principle is standard, the student answer follows the exact same two-part structure and uses very similar transitional language.', 0.8200, 0.8500, 'medium', 'Borderline case. The principle is elementary economics with limited expression variety. Flag for review only if other answers show similar patterns.'),
('Neural networks consist of layers of interconnected nodes that process information. Each connection has a weight that is adjusted during training through backpropagation to minimize the loss function.', 'A neural network is composed of layers of interconnected nodes (neurons) that process information. The connections between nodes have associated weights, which are adjusted during the training process through backpropagation to minimize a loss function.', 'Significant similarity at 87%. The student answer compresses the source material but maintains identical structure and terminology.', 0.8700, 0.8800, 'high', 'Review recommended. While neural network descriptions share common vocabulary, the structural similarity exceeds what would be expected from independent understanding.'),
('The great gatsby explores themes of the american dream, social class, and moral decay in the jazz age of the 1920s.', 'F. Scott Fitzgerald great novel The Great Gatsby explores themes of the American Dream, social stratification, and the moral decay characteristic of the Jazz Age in 1920s America.', 'Moderate similarity for a literary analysis prompt. The student identifies the same themes but with less detail than the reference. This appears to be independent summary rather than copying.', 0.5800, 0.7500, 'low', 'Low plagiarism risk. The student answer is a concise independent summary.'),
('Newtons three laws of motion describe the relationship between forces and motion. The first law states that an object at rest stays at rest unless acted upon by an external force. The second law defines force as mass times acceleration.', 'Newton laws of motion describe how forces affect the motion of objects. The first law states that an object will remain at rest or in uniform motion unless acted upon by an external force. The second law establishes that force equals mass multiplied by acceleration (F=ma).', 'High similarity at 80% but this describes fundamental physics laws that have canonical formulations. The student demonstrates understanding by expressing the laws in their own words while maintaining necessary precision.', 0.8000, 0.8200, 'medium', 'Acceptable for physics fundamentals. Newton laws have standard formulations that naturally result in similar answers. No action needed unless part of a broader pattern.'),
('The process of osmosis involves the movement of water molecules across a semipermeable membrane from a region of lower solute concentration to a region of higher solute concentration until equilibrium is achieved.', 'Osmosis is the net movement of water molecules across a selectively permeable membrane from an area of lower solute concentration to an area of higher solute concentration, continuing until equilibrium is reached.', 'Very high similarity at 93%. This is nearly a verbatim reproduction with only minor word substitutions (semipermeable for selectively permeable, region for area). Strong indicator of source dependency.', 0.9300, 0.9400, 'high', 'Clear plagiarism indicator. The answer is too close to the source for independent writing. Recommend academic integrity review and comparison with the student other answers.');

-- ============================================
-- BROWSER SECURITY EVENTS (15 rows)
-- ============================================
INSERT INTO browser_security_events (session_id, event_type, details, ip_address, user_agent, blocked) VALUES
(2, 'tab_switch', 'Student navigated away from the exam tab. Duration: 3 seconds. Destination tab title not captured due to browser security restrictions.', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', false),
(3, 'focus_lost', 'Browser window lost focus. The exam application was moved to background. Duration: 8 seconds.', '10.0.0.42', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.3', false),
(5, 'copy_paste', 'Paste event detected in answer field for question 7. Content length: 234 characters. Paste source: external clipboard.', '172.16.0.88', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', true),
(5, 'right_click', 'Right-click context menu attempted on exam content. Action was blocked by the browser lockdown system.', '172.16.0.88', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', true),
(7, 'tab_switch', 'Multiple tab switches detected. Tab switch count: 4 within a 5-minute window. This exceeds the configured threshold of 2.', '203.0.113.15', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36', false),
(7, 'dev_tools', 'Browser developer tools opening attempted. F12 key press detected and blocked. This is a critical security event.', '203.0.113.15', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36', true),
(7, 'screen_capture', 'Screen capture attempt detected via Print Screen key press. The action was intercepted and blocked by the browser security module.', '203.0.113.15', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36', true),
(6, 'window_resize', 'Browser window was resized from 1920x1080 to 960x1080. This may indicate the student is using a split-screen arrangement.', '10.0.1.55', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', false),
(9, 'focus_lost', 'Brief window focus loss detected. Duration: 1 second. Likely caused by a system notification.', '192.168.0.201', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36', false),
(10, 'tab_switch', 'Single tab switch detected. Student returned to exam tab within 1 second. Likely accidental.', '192.168.0.202', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 Safari/17.3', false),
(13, 'copy_paste', 'Multiple paste events detected. Total paste events: 3. Combined pasted content length: 1,847 characters. High volume indicates possible external source usage.', '198.51.100.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', true),
(13, 'tab_switch', 'Tab switch detected during the flagged session. Student navigated away from exam for 12 seconds.', '198.51.100.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', false),
(3, 'right_click', 'Right-click attempt blocked on exam question area. No content was copied.', '10.0.0.42', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.3', true),
(14, 'focus_lost', 'Window focus lost twice during the session. Both events were under 2 seconds and coincided with screen reader activation.', '10.0.2.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', false),
(1, 'window_resize', 'Browser window maximized at session start. No further resize events detected. Student maintained full-screen mode throughout.', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36', false);

-- ============================================
-- Seed complete
-- ============================================
