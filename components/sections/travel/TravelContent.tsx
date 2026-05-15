'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { TravelPlace } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';

const REGIONS = ['춘천', '원주', '강릉', '속초', '양양', '고성', '평창', '홍천', '인제', '정선', '삼척', '양평'];
const PLACE_TYPES = ['전체', '카페', '호텔', '캠핑', '공원', '관광'];

const REGION_GRADIENTS: Record<string, string> = {
  춘천: 'linear-gradient(135deg,#dbeafe 0%,#93c5fd 100%)',
  원주: 'linear-gradient(135deg,#fef3c7 0%,#fcd34d 100%)',
  강릉: 'linear-gradient(135deg,#cffafe 0%,#22d3ee 100%)',
  속초: 'linear-gradient(135deg,#ccfbf1 0%,#2dd4bf 100%)',
  양양: 'linear-gradient(135deg,#fce7f3 0%,#f9a8d4 100%)',
  고성: 'linear-gradient(135deg,#d1fae5 0%,#34d399 100%)',
  평창: 'linear-gradient(135deg,#f1f5f9 0%,#cbd5e1 100%)',
  홍천: 'linear-gradient(135deg,#dcfce7 0%,#86efac 100%)',
  인제: 'linear-gradient(135deg,#ede9fe 0%,#a78bfa 100%)',
  정선: 'linear-gradient(135deg,#fef9c3 0%,#fde047 100%)',
  삼척: 'linear-gradient(135deg,#dbeafe 0%,#60a5fa 100%)',
  양평: 'linear-gradient(135deg,#d1fae5 0%,#6ee7b7 100%)',
};

export default function TravelContent() {
  const { data: places, loading } = useGWAADB<TravelPlace>(STORES.PLACES);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('전체');
  const [partnerOnly, setPartnerOnly] = useState(false);

  const byRegion: Record<string, TravelPlace[]> = {};
  places.forEach((p) => {
    if (!byRegion[p.region]) byRegion[p.region] = [];
    byRegion[p.region].push(p);
  });

  const filteredPlaces = places.filter((p) => {
    if (selectedRegion !== 'all' && p.region !== selectedRegion) return false;
    if (typeFilter !== '전체' && !p.typeLabel.includes(typeFilter) && !p.type.includes(typeFilter)) return false;
    if (partnerOnly && !p.isPartner) return false;
    return true;
  });

  const pickRegion = (region: string) => {
    setSelectedRegion(region);
    setTypeFilter('전체');
    setPartnerOnly(false);
  };

  return (
    <>
      {/* Region Explorer */}
      <section id="map" style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <Eyebrow text="PET TRAVEL GUIDE" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10 }}>
              강원도 반려동물 여행
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 480 }}>
              강원도 12개 시군의 반려동물 동반 명소를 만나보세요
            </p>
          </motion.div>

          {/* Region card grid */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            {/* All card */}
            <motion.button
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => pickRegion('all')}
              style={{
                border: selectedRegion === 'all' ? '2.5px solid #16a34a' : '1.5px solid #e5e7eb',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#fff',
                padding: 0,
                textAlign: 'left',
                transition: 'border-color 0.15s',
                position: 'relative',
              }}
            >
              <div style={{
                height: 72,
                background: 'linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28 }}>🗺️</span>
              </div>
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>
                  전체
                </div>
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#6b7280', letterSpacing: '0.08em' }}>
                  {places.length}곳 등록
                </div>
              </div>
              {selectedRegion === 'all' && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>
                </div>
              )}
            </motion.button>

            {/* Region cards */}
            {REGIONS.map((region, i) => {
              const count = byRegion[region]?.length ?? 0;
              const isActive = selectedRegion === region;
              return (
                <motion.button
                  key={region}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pickRegion(region)}
                  style={{
                    border: isActive ? '2.5px solid #16a34a' : '1.5px solid #e5e7eb',
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#fff',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    height: 72,
                    background: REGION_GRADIENTS[region],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} />
                  <div style={{ padding: '10px 14px 12px' }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>
                      {region}
                    </div>
                    <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: count > 0 ? '#16a34a' : '#9ca3af', letterSpacing: '0.08em' }}>
                      {count > 0 ? `${count}곳 등록` : '준비 중'}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected region banner */}
          <AnimatePresence>
            {selectedRegion !== 'all' && (
              <motion.div
                key={selectedRegion}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  marginTop: 20,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
                  border: '1.5px solid #bbf7d0',
                  padding: '22px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#16a34a', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
                    Selected Region
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 4 }}>
                    {selectedRegion}
                  </div>
                  <div style={{ fontSize: 13, color: '#374151' }}>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{byRegion[selectedRegion]?.length ?? 0}곳</span>의 반려동물 동반 명소가 있어요
                  </div>
                </div>
                <button
                  onClick={() => document.getElementById('places')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 9999,
                    background: '#16a34a',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                  }}
                >
                  장소 보기 →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Places grid */}
      <section id="places" style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="ALL PLACES" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10 }}>
              {selectedRegion === 'all' ? '전체 장소' : `${selectedRegion} 장소`}
            </h2>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedRegion !== 'all' && (
              <span style={{
                padding: '7px 14px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                background: '#dcfce7', color: '#166534', border: '1.5px solid #bbf7d0',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {selectedRegion}
                <button
                  onClick={() => pickRegion('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 13, lineHeight: 1, padding: 0 }}
                  aria-label="지역 필터 해제"
                >
                  ×
                </button>
              </span>
            )}
            {PLACE_TYPES.map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '7px 16px', borderRadius: 9999, fontSize: 11, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
                background: typeFilter === t ? '#16a34a' : 'transparent',
                color: typeFilter === t ? '#fff' : '#6b7280',
                borderColor: typeFilter === t ? '#16a34a' : '#d1d5db',
              }}>{t}</button>
            ))}
            <button onClick={() => setPartnerOnly(!partnerOnly)} style={{
              padding: '7px 16px', borderRadius: 9999, fontSize: 11, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', marginLeft: 8,
              background: partnerOnly ? '#fef9c3' : 'transparent',
              color: partnerOnly ? '#854d0e' : '#6b7280',
              borderColor: partnerOnly ? '#d97706' : '#d1d5db',
            }}>⭐ 파트너만</button>
          </motion.div>

          {loading ? <div style={{ height: 300 }} /> : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {filteredPlaces.map((place, i) => (
                  <motion.div
                    key={place.id ?? i}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 28px rgba(0,0,0,0.1)' }}
                    style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', cursor: 'default' }}
                  >
                    <div style={{
                      height: 140,
                      background: place.imageData
                        ? `url(${place.imageData}) center/cover no-repeat`
                        : (REGION_GRADIENTS[place.region] ?? 'linear-gradient(135deg,#e8f5e9,#c8e6c9)'),
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10,
                    }}>
                      {place.isPartner && <span style={{ background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace" }}>PARTNER</span>}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#16a34a', letterSpacing: '0.1em', marginBottom: 4 }}>{place.region} · {place.typeLabel}</div>
                      <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>{place.icon} {place.name}</h3>
                      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{place.feature}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  );
}
