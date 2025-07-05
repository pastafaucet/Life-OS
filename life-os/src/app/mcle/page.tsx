'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MCLECourse {
  id: string;
  title: string;
  provider: string;
  date_completed: Date;
  hours: number;
  category: 'General' | 'Ethics' | 'Bias' | 'Competence' | 'Technology' | 'Civility';
  applies_to_ca: boolean;
  applies_to_nv: boolean;
  ca_certificate_filename?: string;
  ca_certificate_path?: string;
  nv_certificate_filename?: string;
  nv_certificate_path?: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

interface NewCourseForm {
  title: string;
  provider: string;
  date_completed: string;
  hours: number;
  category: 'General' | 'Ethics' | 'Bias' | 'Competence' | 'Technology' | 'Civility';
  applies_to_ca: boolean;
  applies_to_nv: boolean;
  ca_certificate?: File;
  nv_certificate?: File;
  notes: string;
}

interface StateRequirements {
  total: number;
  ethics: number;
  bias: number;
  competence: number;
  technology: number;
  civility: number;
}

const CA_REQUIREMENTS: StateRequirements = {
  total: 25,
  ethics: 4,
  bias: 2,
  competence: 2,
  technology: 1,
  civility: 1
};

// Nevada requirements - updated with actual values
const NV_REQUIREMENTS: StateRequirements = {
  total: 10,
  ethics: 2,
  bias: 1, // Substance abuse/addiction/mental health
  competence: 0,
  technology: 0,
  civility: 0
};

export default function MCLEPage() {
  const [courses, setCourses] = useState<MCLECourse[]>([]);
  const [activeYears, setActiveYears] = useState<(number | string)[]>([new Date().getFullYear()]);
  const [showAllData, setShowAllData] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MCLECourse | null>(null);
  const [newCourseForm, setNewCourseForm] = useState<NewCourseForm>({
    title: '',
    provider: '',
    date_completed: '',
    hours: 0,
    category: 'General',
    applies_to_ca: true,
    applies_to_nv: false,
    notes: ''
  });

  // Generate year tabs (current year + 2 prior years + "All Data")
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2];
  const availableYears = [...recentYears, 'All Data'];

  // Toggle year selection
  const toggleYear = (year: number | string) => {
    if (year === 'All Data') {
      setShowAllData(!showAllData);
      if (!showAllData) {
        setActiveYears(['All Data']);
      } else {
        setActiveYears([currentYear]);
      }
    } else {
      setShowAllData(false);
      setActiveYears(prev => {
        const numericPrev = prev.filter((y): y is number => typeof y === 'number');
        return numericPrev.includes(year as number)
          ? numericPrev.filter(y => y !== year)
          : [...numericPrev, year as number].sort((a, b) => b - a);
      });
    }
  };

  // Get filtered courses based on active years
  const getFilteredCourses = () => {
    if (showAllData || activeYears.includes('All Data')) {
      return courses.sort((a, b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime());
    }
    
    return courses.filter(course => {
      const courseYear = new Date(course.date_completed).getFullYear();
      return activeYears.some(year => typeof year === 'number' && year === courseYear);
    }).sort((a, b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime());
  };

  // Calculate progress for a state
  const calculateProgress = (forCalifornia: boolean) => {
    const filteredCourses = getFilteredCourses().filter(course => 
      forCalifornia ? course.applies_to_ca : course.applies_to_nv
    );

    const requirements = forCalifornia ? CA_REQUIREMENTS : NV_REQUIREMENTS;
    
    const progress = {
      total: filteredCourses.reduce((sum, course) => sum + course.hours, 0),
      ethics: filteredCourses.filter(c => c.category === 'Ethics').reduce((sum, course) => sum + course.hours, 0),
      bias: filteredCourses.filter(c => c.category === 'Bias').reduce((sum, course) => sum + course.hours, 0),
      competence: filteredCourses.filter(c => c.category === 'Competence').reduce((sum, course) => sum + course.hours, 0),
      technology: filteredCourses.filter(c => c.category === 'Technology').reduce((sum, course) => sum + course.hours, 0),
      civility: filteredCourses.filter(c => c.category === 'Civility').reduce((sum, course) => sum + course.hours, 0)
    };

    return { progress, requirements };
  };

  // Handle creating/updating course
  const handleSaveCourse = () => {
    if (!newCourseForm.title.trim() || !newCourseForm.date_completed || newCourseForm.hours <= 0) return;

    const courseData: MCLECourse = {
      id: editingCourse?.id || Date.now().toString(),
      title: newCourseForm.title,
      provider: newCourseForm.provider,
      date_completed: new Date(newCourseForm.date_completed),
      hours: newCourseForm.hours,
      category: newCourseForm.category,
      applies_to_ca: newCourseForm.applies_to_ca,
      applies_to_nv: newCourseForm.applies_to_nv,
      ca_certificate_filename: newCourseForm.ca_certificate?.name,
      ca_certificate_path: newCourseForm.ca_certificate ? `/certificates/california/${newCourseForm.ca_certificate.name}` : undefined,
      nv_certificate_filename: newCourseForm.nv_certificate?.name,
      nv_certificate_path: newCourseForm.nv_certificate ? `/certificates/nevada/${newCourseForm.nv_certificate.name}` : undefined,
      notes: newCourseForm.notes,
      created_at: editingCourse?.created_at || new Date(),
      updated_at: new Date()
    };

    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? courseData : c));
    } else {
      setCourses([courseData, ...courses]);
    }

    handleCloseModal();
  };

  // Handle editing course
  const handleEditCourse = (course: MCLECourse) => {
    setEditingCourse(course);
    setNewCourseForm({
      title: course.title,
      provider: course.provider,
      date_completed: course.date_completed.toISOString().split('T')[0],
      hours: course.hours,
      category: course.category,
      applies_to_ca: course.applies_to_ca,
      applies_to_nv: course.applies_to_nv,
      notes: course.notes
    });
    setShowNewCourseModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowNewCourseModal(false);
    setEditingCourse(null);
    setNewCourseForm({
      title: '',
      provider: '',
      date_completed: '',
      hours: 0,
      category: 'General',
      applies_to_ca: true,
      applies_to_nv: false,
      notes: ''
    });
  };

  // Handle file upload
  const handleFileUpload = (file: File, state: 'ca' | 'nv') => {
    if (state === 'ca') {
      setNewCourseForm({ ...newCourseForm, ca_certificate: file });
    } else {
      setNewCourseForm({ ...newCourseForm, nv_certificate: file });
    }
  };

  // Get progress bar color
  const getProgressColor = (current: number, required: number) => {
    if (current >= required) return 'bg-green-500';
    if (current >= required * 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get certificate status
  const getCertificateStatus = (course: MCLECourse, state: 'ca' | 'nv') => {
    const hasApplicability = state === 'ca' ? course.applies_to_ca : course.applies_to_nv;
    const hasCertificate = state === 'ca' ? course.ca_certificate_filename : course.nv_certificate_filename;
    
    if (!hasApplicability) return '➖';
    return hasCertificate ? '✅' : '❌';
  };

  const filteredCourses = getFilteredCourses();
  const caData = calculateProgress(true);
  const nvData = calculateProgress(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/legal" className="text-blue-400 hover:text-blue-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">MCLE Tracking</h1>
                <p className="text-gray-300">Continuing Legal Education Management</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Course
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Year Selection Tabs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Select Years to Track</h3>
          <div className="flex flex-wrap gap-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeYears.includes(year)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Selected: {activeYears.length > 0 ? activeYears.join(', ') : 'None'} 
            {activeYears.length > 1 && ' (Multi-year tracking)'}
          </p>
        </div>

        {/* Main Content Layout - Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Courses List - Takes up 3/4 of the space */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">
                  Courses ({filteredCourses.length})
                </h3>
                <p className="text-gray-400 text-sm">
                  Showing courses from: {activeYears.length > 0 ? activeYears.join(', ') : 'No years selected'}
                </p>
              </div>

              <div className="overflow-x-auto">
                {filteredCourses.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No courses found</h3>
                    <p className="text-gray-400 mb-4">
                      {activeYears.length === 0 
                        ? 'Select years to view courses or add your first course.'
                        : 'No courses found for the selected years. Add your first course!'
                      }
                    </p>
                    <button
                      onClick={() => setShowNewCourseModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add First Course
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">States</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Certificates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-white">{course.title}</div>
                              <div className="text-sm text-gray-400">{course.provider}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {course.date_completed.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {course.hours}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {course.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {course.applies_to_ca && course.applies_to_nv ? 'CA, NV' : 
                             course.applies_to_ca ? 'CA' : 
                             course.applies_to_nv ? 'NV' : 'None'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <span title="California Certificate">CA: {getCertificateStatus(course, 'ca')}</span>
                              <span title="Nevada Certificate">NV: {getCertificateStatus(course, 'nv')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-400 hover:text-blue-300 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setCourses(courses.filter(c => c.id !== course.id))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Progress Trackers Sidebar - Takes up 1/4 of the space */}
          <div className="lg:col-span-1 space-y-6">
            {/* California Requirements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">California Requirements</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Total Hours</span>
                    <span className="text-white">{caData.progress.total}/{caData.requirements.total}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.total, caData.requirements.total)}`}
                      style={{ width: `${Math.min((caData.progress.total / caData.requirements.total) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Ethics</span>
                    <span className="text-white">{caData.progress.ethics}/{caData.requirements.ethics}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.ethics, caData.requirements.ethics)}`}
                      style={{ width: `${Math.min((caData.progress.ethics / caData.requirements.ethics) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Bias/Elimination</span>
                    <span className="text-white">{caData.progress.bias}/{caData.requirements.bias}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.bias, caData.requirements.bias)}`}
                      style={{ width: `${Math.min((caData.progress.bias / caData.requirements.bias) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Competence</span>
                    <span className="text-white">{caData.progress.competence}/{caData.requirements.competence}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.competence, caData.requirements.competence)}`}
                      style={{ width: `${Math.min((caData.progress.competence / caData.requirements.competence) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Technology</span>
                    <span className="text-white">{caData.progress.technology}/{caData.requirements.technology}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.technology, caData.requirements.technology)}`}
                      style={{ width: `${Math.min((caData.progress.technology / caData.requirements.technology) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Civility</span>
                    <span className="text-white">{caData.progress.civility}/{caData.requirements.civility}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(caData.progress.civility, caData.requirements.civility)}`}
                      style={{ width: `${Math.min((caData.progress.civility / caData.requirements.civility) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nevada Requirements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Nevada Requirements</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Total Hours</span>
                    <span className="text-white">{nvData.progress.total}/{nvData.requirements.total}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nvData.progress.total, nvData.requirements.total)}`}
                      style={{ width: `${Math.min((nvData.progress.total / nvData.requirements.total) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Ethics</span>
                    <span className="text-white">{nvData.progress.ethics}/{nvData.requirements.ethics}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nvData.progress.ethics, nvData.requirements.ethics)}`}
                      style={{ width: `${Math.min((nvData.progress.ethics / nvData.requirements.ethics) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Substance Abuse/Mental Health</span>
                    <span className="text-white">{nvData.progress.bias}/{nvData.requirements.bias}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nvData.progress.bias, nvData.requirements.bias)}`}
                      style={{ width: `${Math.min((nvData.progress.bias / nvData.requirements.bias) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Bottom Right (Same as Legal Cases page) */}
        <div className="fixed bottom-6 right-6 bg-gray-800 rounded-lg shadow-md p-4">
          <div className="space-y-2">
            <Link 
              href="/legal"
              className="block w-full text-left px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors font-medium"
            >
              Cases
            </Link>
            <button 
              className="w-full text-left px-3 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors font-medium"
              disabled
            >
              MCLE Tracking
            </button>
            <button 
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
              disabled
            >
              Work Contacts (Coming Soon)
            </button>
            <button 
              className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
              disabled
            >
              Work Notes (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={newCourseForm.title}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                    className="w-full text-white bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Course title"
                  />
                </div>

                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                  <input
                    type="text"
                    value={newCourseForm.provider}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, provider: e.target.value })}
                    className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CLE provider"
                  />
                </div>

                {/* Date Completed */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Completed *</label>
                  <input
                    type="date"
                    value={newCourseForm.date_completed}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, date_completed: e.target.value })}
                    className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newCourseForm.hours}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, hours: parseFloat(e.target.value) || 0 })}
                    className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    value={newCourseForm.category}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, category: e.target.value as any })}
                    className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Ethics">Ethics</option>
                    <option value="Bias">Bias/Elimination</option>
                    <option value="Competence">Competence</option>
                    <option value="Technology">Technology</option>
                    <option value="Civility">Civility</option>
                  </select>
                </div>

                {/* State Applicability */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Applies To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCourseForm.applies_to_ca}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, applies_to_ca: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-gray-300">California</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCourseForm.applies_to_nv}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, applies_to_nv: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-gray-300">Nevada</span>
                    </label>
                  </div>
                </div>

                {/* California Certificate */}
                {newCourseForm.applies_to_ca && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">California Certificate</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ca')}
                      className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {newCourseForm.ca_certificate && (
                      <p className="text-green-400 text-sm mt-1">✅ {newCourseForm.ca_certificate.name}</p>
                    )}
                  </div>
                )}

                {/* Nevada Certificate */}
                {newCourseForm.applies_to_nv && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nevada Certificate</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'nv')}
                      className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {newCourseForm.nv_certificate && (
                      <p className="text-green-400 text-sm mt-1">✅ {newCourseForm.nv_certificate.name}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={newCourseForm.notes}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, notes: e.target.value })}
                    className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes about this course"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCourse}
                  disabled={!newCourseForm.title.trim() || !newCourseForm.date_completed || newCourseForm.hours <= 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
