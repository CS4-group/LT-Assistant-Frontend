import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RatingPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="p-4">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="w-full">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-lg font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary bg-white text-primary'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {(() => {
          const currentTab = tabs.find(tab => tab.id === activeTab);
          if (!currentTab) return null;
          
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentTab.title}</h2>
              <p className="text-gray-600">{currentTab.description}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
