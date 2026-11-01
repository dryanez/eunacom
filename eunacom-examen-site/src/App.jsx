import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CoursesSection from './components/CoursesSection';
import CourseDetailModal from './components/CourseDetailModal';
import EnrollmentModal from './components/EnrollmentModal';
import FreeMockExamsSection from './components/FreeMockExamsSection';
import PrerequisitesMatrix from './components/PrerequisitesMatrix';
import VideoMasterclassPlayer from './components/VideoMasterclassPlayer';
import BlogSection from './components/BlogSection';
import BlogArticleModalOrPage from './components/BlogArticleModalOrPage';
import BlogTopicProposer from './components/BlogTopicProposer';
import FaqSection from './components/FaqSection';
import DoctorMentorshipModal from './components/DoctorMentorshipModal';
import Footer from './components/Footer';

export default function App() {
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false);
  const [isSEOStudioOpen, setIsSEOStudioOpen] = useState(false);

  // Global EducationalOrganization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "EUNACOM Examen Chile",
    "alternateName": ["Academia Examen EUNACOM", "AEE"],
    "url": "https://eunacom-examen.cl",
    "logo": "https://eunacom-examen.cl/logo.png",
    "description": "Academia de alto rendimiento médico y preparación para el Examen Único Nacional de Conocimientos de Medicina (EUNACOM Teórico ST y ECOE Práctico SP) en Chile.",
    "founder": {
      "@type": "Physician",
      "name": "Academia Examen EUNACOM",
      "jobTitle": "Equipo académico",
      "areaServed": "Chile",
      "areaServed": "Chile"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Santiago",
      "addressCountry": "CL"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+56976694606",
      "contactType": "Academic Advising & Enrollment",
      "availableLanguage": ["Spanish"]
    },
    "sameAs": [
      "https://wa.me/56976694606"
    ]
  };

  const handleStartDiagnostic = () => {
    const el = document.getElementById('diagnostico');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Navbar */}
      <Navbar
        onOpenMentorship={() => setIsMentorshipOpen(true)}
        onSelectCourse={(course) => setSelectedCourseForEnrollment(course)}
      />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* 1. Hero Section */}
        <Hero
          onOpenMentorship={() => setIsMentorshipOpen(true)}
          onStartDiagnostic={handleStartDiagnostic}
        />

        {/* 2. Courses & Pricing Section */}
        <CoursesSection
          onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
          onViewDetails={(c) => setSelectedCourseForDetail(c)}
          onOpenMentorship={() => setIsMentorshipOpen(true)}
        />

        {/* 3. Free Diagnostic 5-Question Mock Exam */}
        <FreeMockExamsSection
          onOpenMentorship={() => setIsMentorshipOpen(true)}
          onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
        />

        {/* 4. Interactive Prerequisites & Convalidation Matrix */}
        <PrerequisitesMatrix
          onOpenMentorship={() => setIsMentorshipOpen(true)}
        />

        {/* 5. Video Masterclass Player */}
        <VideoMasterclassPlayer
          onOpenMentorship={() => setIsMentorshipOpen(true)}
          onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
        />

        {/* 6. Blog & Guides Section */}
        <BlogSection
          onSelectArticle={(art) => setSelectedArticle(art)}
          onOpenTopicProposer={() => setIsSEOStudioOpen(true)}
        />

        {/* 7. FAQs Accordion */}
        <FaqSection
          onOpenMentorship={() => setIsMentorshipOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenMentorship={() => setIsMentorshipOpen(true)}
        onOpenSEOStudio={() => setIsSEOStudioOpen(true)}
      />

      {/* Modals */}
      {selectedCourseForDetail && (
        <CourseDetailModal
          course={selectedCourseForDetail}
          onClose={() => setSelectedCourseForDetail(null)}
          onEnroll={(c) => {
            setSelectedCourseForDetail(null);
            setSelectedCourseForEnrollment(c);
          }}
        />
      )}

      {selectedCourseForEnrollment && (
        <EnrollmentModal
          course={selectedCourseForEnrollment}
          onClose={() => setSelectedCourseForEnrollment(null)}
        />
      )}

      {selectedArticle && (
        <BlogArticleModalOrPage
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectCourse={(c) => setSelectedCourseForEnrollment(c)}
          onOpenMentorship={() => {
            setSelectedArticle(null);
            setIsMentorshipOpen(true);
          }}
        />
      )}

      {isMentorshipOpen && (
        <DoctorMentorshipModal
          onClose={() => setIsMentorshipOpen(false)}
        />
      )}

      {isSEOStudioOpen && (
        <BlogTopicProposer
          onClose={() => setIsSEOStudioOpen(false)}
        />
      )}
    </div>
  );
}
