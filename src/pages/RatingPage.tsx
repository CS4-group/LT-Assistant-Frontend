import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courses, clubs, teachers, reviews as mockReviews } from '@/lib/mockData';
import { SidebarList } from '@/components/SidebarList';
import { ReviewCard } from '@/components/ReviewCard';
import { AddReviewPanel } from '@/components/AddReviewPanel';
import { SearchBar } from '@/components/SearchBar';

export function RatingPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isReviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchQuery('');
  };

  const tabs = [
    { 
      id: 'courses', 
      label: 'Courses',
      title: 'Courses Rating',
      description: 'Rate and review your courses here.'
    },
    { 
      id: 'clubs', 
      label: 'Clubs',
      title: 'Clubs Rating', 
      description: 'Rate and review clubs here.'
    },
    { 
      id: 'teachers', 
      label: 'Teachers',
      title: 'Teachers Rating',
      description: 'Rate and review your teachers here.'
    }
  ];

  const activeData = useMemo(() => {
    switch (activeTab) {
      case 'courses':
        return courses;
      case 'clubs':
        return clubs;
      case 'teachers':
        return teachers;
      default:
        return [];
    }
  }, [activeTab]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return activeData;
    return activeData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeData, searchQuery]);

  useEffect(() => {
    if (filteredData.length > 0) {
      if (!selectedItemId || !filteredData.find(item => item.id === selectedItemId)) {
        setSelectedItemId(filteredData[0].id);
      }
    } else {
      setSelectedItemId(null);
    }
  }, [filteredData, selectedItemId]);

  const displayedReviews = useMemo(() => {
    if (!selectedItemId) return [];
    return reviews.filter(review => review.itemId === selectedItemId);
  }, [selectedItemId, reviews]);

  const handleAddReview = (review: { rating: number; comment: string }) => {
    if (!selectedItemId) return;

    const newReview = {
      id: `review-${selectedItemId}-${Date.now()}`,
      itemId: selectedItemId,
      user: { name: 'Current User', avatarUrl: 'https://i.pravatar.cc/150?u=currentUser' }, // Placeholder user
      ...review,
    };

    setReviews(prevReviews => [...prevReviews, newReview]);
    setReviewPanelOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="p-4 border-b flex items-center justify-center relative bg-white">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="flex items-center space-x-2 absolute left-4 top-1/2 -translate-y-1/2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <img src="/logo.png" alt="Logo" className="h-12" />
      </div>

      {/* Tab Navigation */}
      <div className="w-full border-b">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-4 px-6 text-lg font-semibold border-b-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                activeTab === tab.id
                  ? 'border-primary bg-white text-primary'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b">
        <SearchBar
          placeholder={`Search for a ${activeTab.slice(0, -1)}...`}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/3 border-r overflow-y-auto bg-white p-4">
          <h2 className="text-xl font-semibold mb-4 capitalize">{activeTab} List</h2>
          <SidebarList
            items={filteredData}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {selectedItemId ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">
                Reviews for {activeData.find(item => item.id === selectedItemId)?.title}
              </h2>
              {displayedReviews.length > 0 ? (
                displayedReviews.map(review => <ReviewCard key={review.id} review={review} />)
              ) : (
                <p>No reviews yet. Be the first to add one!</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select an item from the list to see reviews.</p>
            </div>
          )}
        </main>
      </div>
      
      {/* Add Review Button */}
      <div className="absolute bottom-4 left-4">
          <Button onClick={() => setReviewPanelOpen(true)} disabled={!selectedItemId}>
            Add Review
          </Button>
      </div>
      
      {isReviewPanelOpen && selectedItemId && (
        <AddReviewPanel
          itemName={activeData.find(item => item.id === selectedItemId)?.title || ''}
          onClose={() => setReviewPanelOpen(false)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
}
