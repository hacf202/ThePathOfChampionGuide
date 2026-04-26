import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useTranslation } from "../../hooks/useTranslation";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";
import EntityDetailLayout from "../common/EntityDetailLayout";
import { autoLinkResources } from "../../utils/markupUtils";
import ResourceSectionRenderer from "./ResourceSectionRenderer";

const ResourceDetailPage = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { tUI, language } = useTranslation();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/api/resources/${resourceId}`);
        setResource(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết tài nguyên:", error);
        // Nếu không tìm thấy hoặc lỗi, quay lại danh sách sau 2s
        setTimeout(() => navigate("/resources"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        {tUI("common.notFound") || "Không tìm thấy dữ liệu tài nguyên."}
      </div>
    );
  }

  const isEn = language === 'en';

  return (
    <EntityDetailLayout
      item={{
        ...resource,
        name: isEn ? resource.name_en : resource.name,
        description: autoLinkResources(isEn ? resource.description_en : resource.description),
      }}
      rarity={isEn ? resource.category_en : resource.category}
      imageSrc={resource.icon}
      name={isEn ? resource.name_en : resource.name}
      description={autoLinkResources(isEn ? resource.description_en : resource.description)}
      pageKeywords={`${isEn ? resource.name_en : resource.name}, resource, LoR resource, PoC resource, ${isEn ? resource.category_en : resource.category}`}
      onBack={() => navigate("/resources")}
      labels={{
        back: tUI("common.back"),
      }}
    >
      <div className="space-y-10 mt-6 sm:mt-8">
        {resource.sections?.map((section, index) => (
          <motion.section 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-1 h-5 bg-primary-500 rounded-full mr-3 shadow-sm shadow-primary-500/50" />
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary uppercase tracking-tight">
                <MarkupRenderer text={isEn ? section.sectionName_en : section.sectionName} />
              </h2>
            </div>
            
            <ResourceSectionRenderer section={section} language={language} />
          </motion.section>
        ))}
      </div>
    </EntityDetailLayout>
  );
};

export default ResourceDetailPage;
