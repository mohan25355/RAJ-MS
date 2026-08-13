import { useState } from 'react';
import { Btn, PageHead } from '../components/ui';

const selectProduct = (item, page, go) => {
  localStorage.setItem('raja_selected_product', JSON.stringify(item));
  go(page, { keepOrder: page === 'contact' });
};

// ============================================
// CATEGORY IMAGES
// ============================================

const CATEGORY_IMAGES = {
  'Head Protection': 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=900&q=85',
  'Ear Protection': 'https://images.unsplash.com/photo-1516571748831-5d81767b788d?auto=format&fit=crop&w=900&q=85',
  'First Aid Products': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&w=900&q=85',
  'Eye Protection': 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?auto=format&fit=crop&w=900&q=85',
  'Fall Protection': 'https://images.unsplash.com/photo-1578590494309-246790fb33c3?auto=format&fit=crop&w=900&q=85',
  'Respiratory Protection': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=900&q=85',
  'Emergency Response Equipment': 'https://images.unsplash.com/photo-1584467735871-bd4b2c35a98b?auto=format&fit=crop&w=900&q=85',
  'Body Protection': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=85',
  'Road Safety Products': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=85',
  'Waste Management Products': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=85',
  'Tools and Instrument': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85',
  'Water Pumps': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=900&q=85',
};

// ============================================
// PRODUCT IMAGES (Unique images for each product)
// ============================================

const PRODUCT_IMAGES = {
  // ---- Head Protection ----
  'Safety Helmet Std. Series': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
  'Safety Helmet Vent. Series': 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
  'ABS Helmet': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
  'Welding Helmet': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  'Welding Shield Helmet Mountable': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
  'Grinding Face Shield A Type': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
  'Grinding Face Shield Spring Type': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'Grinding Face Shield Elastic Type': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  'Electrical Helmet': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'Grinding Face Shield Ratchet Type': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  'Heat Resistance Face Shield': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'Helmet With Light': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'Bump Cap': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',

  // ---- Ear Protection ----
  'Ear Muff': 'https://images.unsplash.com/photo-1516571748831-5d81767b788d?auto=format&fit=crop&w=800&q=80',
  'Executive Ear Muff': 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  'Helmet Mountable Ear Muff': 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=800&q=80',
  'Reusable Ear Plug': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80',
  'Ear Plug': 'https://images.unsplash.com/photo-1585386959982-1c33c48ff9c7?auto=format&fit=crop&w=800&q=80',
  'Ear Plug Dispenser': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&w=800&q=80',

  // ---- First Aid Products ----
  'Venyl Kit': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',
  'Travel Kit': 'https://images.unsplash.com/photo-1603398938625-899969a05b2f?auto=format&fit=crop&w=800&q=80',
  'Medical Kit': 'https://images.unsplash.com/photo-1587582423116-ec07293f0da7?auto=format&fit=crop&w=800&q=80',
  'Plastic Kit': 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=800&q=80',
  'Foldable Stretcher': 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=800&q=80',

  // ---- Eye Protection ----
  'Safety Goggles': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  'Safety Spectacles': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
  'Protective Goggles': 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=800&q=80',
  'Safety Glasses': 'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?auto=format&fit=crop&w=800&q=80',
  'Face Shield': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
  'Eye Wash Station': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&w=800&q=80',

  // ---- Fall Protection ----
  'Retractable Fall Arrester': 'https://images.unsplash.com/photo-1578590494309-246790fb33c3?auto=format&fit=crop&w=800&q=80',
  'Parapet Anchor': 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=800&q=80',
  'PP Rope': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
  'Tool Lanyard': 'https://images.unsplash.com/photo-1585590837516-6e2e7ed4b0f6?auto=format&fit=crop&w=800&q=80',
  'Multi Purpose Harness': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'A Class Harness': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
  'L Class Harness': 'https://images.unsplash.com/photo-1560780552-ba54683cb263?auto=format&fit=crop&w=800&q=80',
  'Safety Net With Fish Net': 'https://images.unsplash.com/photo-1573497491765-55d5c1f1b6b0?auto=format&fit=crop&w=800&q=80',
  '3 Layer Safety Net': 'https://images.unsplash.com/photo-1580983230786-31255c1c2c3a?auto=format&fit=crop&w=800&q=80',
  'Barrication Fence Net': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
  'Karabiner': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
  'Swing Seat': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'Descender': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  'Horizontal Life Line': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',

  // ---- Respiratory Protection ----
  'Carbon Mask': 'https://images.unsplash.com/photo-1605164599901-db0d0d5ecac3?auto=format&fit=crop&w=800&q=80',
  '3Ply Mask Loop Type': 'https://images.unsplash.com/photo-1584744982551-2b0a8a1fd0a2?auto=format&fit=crop&w=800&q=80',
  '3M 9000 IN': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
  'Dusk Mask With Valve': 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=800&q=80',
  '3M 9004 IN': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  'Dusk Mask': 'https://images.unsplash.com/photo-1605164599901-db0d0d5ecac3?auto=format&fit=crop&w=800&q=80',
  'Full Face Mask With Double Cartridges': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
  'Half Face Mask With Single Cartridges': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
  '3M N95 Mask': 'https://images.unsplash.com/photo-1584744982551-2b0a8a1fd0a2?auto=format&fit=crop&w=800&q=80',
  'Cartridges': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',

  // ---- Emergency Response Equipment ----
  'Life Jacket / Life Buoy': 'https://images.unsplash.com/photo-1516569422656-de1731ba2f61?auto=format&fit=crop&w=800&q=80',
  'Loto Kit': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'Spill Kit': 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80',

  // ---- Body Protection ----
  'Nomex Fire Suit': 'https://images.unsplash.com/photo-1519669417670-68775a50919e?auto=format&fit=crop&w=800&q=80',
  'Aluminium Fire Suit': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'ARC Flash Suit': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
  'PVC Suit With Hood': 'https://images.unsplash.com/photo-1581093458791-9d42cc03d6f7?auto=format&fit=crop&w=800&q=80',
  'Cotton Coverall': 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?auto=format&fit=crop&w=800&q=80',
  'Disposable Coverall': 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=800&q=80',
  'PVC Apron': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=800&q=80',
  'Leather Apron': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'Cotton Apron': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=800&q=80',
  'Leather Arm Guard': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'Leather Leg Guard': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'Leather Shoulder Guard': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'Rain Coat': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',

  // ---- Road Safety Products ----
  'Staff Safety Jacket': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80',
  'Safety Jacket 3 Side Open': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
  'Reflective Vest Belt': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
  'Security Jacket': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80',
  'Safety Cone': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'PU Spring Post': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'Queue Manager': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Scissors Barrier': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
  'Road Studs': 'https://images.unsplash.com/photo-1573497491765-55d5c1f1b6b0?auto=format&fit=crop&w=800&q=80',
  'PVC Speed Breaker': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  'Corner Guards': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=800&q=80',
  'PVC Floor Stands': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'Dome Mirror': 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80',
  'Convex Mirror': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Reflection Tape': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
  'Wind Sock With Stand': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  'PVC Chain': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
  'Safety Triangle': 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
  'Solar Chevron': 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
  'Baton Light': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'PVC Water Filled Barrier': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
  'Metal Detector': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',

  // ---- Waste Management Products ----
  '120L Mobile Garbage Bin': 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=80',
  '240L Mobile Garbage Bin': 'https://images.unsplash.com/photo-1611284446617-b295b7050fea?auto=format&fit=crop&w=800&q=80',
  '360L Mobile Garbage Bin': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
  '660L Mobile Garbage Bin': 'https://images.unsplash.com/photo-1567169866456-2b73f9df2f9d?auto=format&fit=crop&w=800&q=80',
  '1100L Mobile Garbage Bin': 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=800&q=80',
  '60 LTR Bin': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  '80 LTR Bin': 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=80',
  '110 LTR Bin': 'https://images.unsplash.com/photo-1611284446617-b295b7050fea?auto=format&fit=crop&w=800&q=80',
  '150 LTR Bin': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
  'Single Stand': 'https://images.unsplash.com/photo-1567169866456-2b73f9df2f9d?auto=format&fit=crop&w=800&q=80',
  'Double Stand': 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=800&q=80',
  'Metro With Swing Top': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  'Metro With Open Top': 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=80',
  'Magnum 15L': 'https://images.unsplash.com/photo-1587582423116-ec07293f0da7?auto=format&fit=crop&w=800&q=80',
  'Magnum 20L': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',
  '120L Pedal Bin': 'https://images.unsplash.com/photo-1611284446617-b295b7050fea?auto=format&fit=crop&w=800&q=80',
  '240L Pedal Bin': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
  'Trolly Bins': 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=800&q=80',
  'Duo Bins': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  'Trio Bins': 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=80',
  'Quatro Bins': 'https://images.unsplash.com/photo-1611284446617-b295b7050fea?auto=format&fit=crop&w=800&q=80',
  'Two in One': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',

  // ---- Tools and Instrument ----
  'Axe': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  'Mallet': 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=800&q=80',
  'Hammer': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  'Corkscrew': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
  'Pliers': 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80',
  'Construction Box': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'Wheel Barrow': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
  'Single Wheel Barrow': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
  'Back Saw': 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=800&q=80',
  'Chain Saw': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'Spirit Level': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'Tool Box': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'Step Ladder': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
  'Measurement Tape': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',

  // ---- Water Pumps ----
  'Submersible Pumps': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
  'Garden Water Pumps': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  'Water Circulation Pump': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'Deep Well Pumps': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
  'Single Phase': 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?auto=format&fit=crop&w=800&q=80',
  'CDS Series': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
  'Dewatering Pump': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
};

// ============================================
// CATEGORY DATA
// ============================================

const CATEGORY_DATA = [
  ['Head Protection', ['Safety Helmet Std. Series', 'Safety Helmet Vent. Series', 'ABS Helmet', 'Welding Helmet', 'Welding Shield Helmet Mountable', 'Grinding Face Shield A Type', 'Grinding Face Shield Spring Type', 'Grinding Face Shield Elastic Type', 'Electrical Helmet', 'Grinding Face Shield Ratchet Type', 'Heat Resistance Face Shield', 'Helmet With Light', 'Bump Cap']],
  ['Ear Protection', ['Ear Muff', 'Executive Ear Muff', 'Helmet Mountable Ear Muff', 'Reusable Ear Plug', 'Ear Plug', 'Ear Plug Dispenser']],
  ['First Aid Products', ['Venyl Kit', 'Travel Kit', 'Medical Kit', 'Plastic Kit', 'Foldable Stretcher']],
  ['Eye Protection', ['Safety Goggles', 'Safety Spectacles', 'Protective Goggles', 'Safety Glasses', 'Face Shield', 'Eye Wash Station']],
  ['Fall Protection', ['Retractable Fall Arrester', 'Parapet Anchor', 'PP Rope', 'Tool Lanyard', 'Multi Purpose Harness', 'A Class Harness', 'L Class Harness', 'Safety Net With Fish Net', '3 Layer Safety Net', 'Barrication Fence Net', 'Karabiner', 'Swing Seat', 'Descender', 'Horizontal Life Line']],
  ['Respiratory Protection', ['Carbon Mask', '3Ply Mask Loop Type', '3M 9000 IN', 'Dusk Mask With Valve', '3M 9004 IN', 'Dusk Mask', 'Full Face Mask With Double Cartridges', 'Half Face Mask With Single Cartridges', '3M N95 Mask', 'Cartridges']],
  ['Emergency Response Equipment', ['Life Jacket / Life Buoy', 'Loto Kit', 'Spill Kit']],
  ['Body Protection', ['Nomex Fire Suit', 'Aluminium Fire Suit', 'ARC Flash Suit', 'PVC Suit With Hood', 'Cotton Coverall', 'Disposable Coverall', 'PVC Apron', 'Leather Apron', 'Cotton Apron', 'Leather Arm Guard', 'Leather Leg Guard', 'Leather Shoulder Guard', 'Rain Coat']],
  ['Road Safety Products', ['Staff Safety Jacket', 'Safety Jacket 3 Side Open', 'Reflective Vest Belt', 'Security Jacket', 'Safety Cone', 'PU Spring Post', 'Queue Manager', 'Scissors Barrier', 'Road Studs', 'PVC Speed Breaker', 'Corner Guards', 'PVC Floor Stands', 'Dome Mirror', 'Convex Mirror', 'Reflection Tape', 'Wind Sock With Stand', 'PVC Chain', 'Safety Triangle', 'Solar Chevron', 'Baton Light', 'PVC Water Filled Barrier', 'Metal Detector']],
  ['Waste Management Products', [
    ['Combination Series - FRP', ['Duo Bins', 'Trio Bins', 'Quatro Bins', 'Two in One']],
    ['Combination Series - SS', ['Duo Bins', 'Trio Bins']],
    ['Mobile Garbage Bins', ['120L Mobile Garbage Bin', '240L Mobile Garbage Bin', '360L Mobile Garbage Bin', '660L Mobile Garbage Bin', '1100L Mobile Garbage Bin']],
    ['Classic Free Stand Series', ['60 LTR Bin', '80 LTR Bin', '110 LTR Bin', '150 LTR Bin', 'Single Stand', 'Double Stand', 'Metro With Swing Top', 'Metro With Open Top']],
    ['Bio Medical Pedal Series', ['Magnum 15L', 'Magnum 20L', '120L Pedal Bin', '240L Pedal Bin', 'Trolly Bins']],
  ]],
  ['Tools and Instrument', ['Axe', 'Mallet', 'Hammer', 'Corkscrew', 'Pliers', 'Construction Box', 'Wheel Barrow', 'Single Wheel Barrow', 'Back Saw', 'Chain Saw', 'Spirit Level', 'Tool Box', 'Step Ladder', 'Measurement Tape']],
  ['Water Pumps', ['Submersible Pumps', 'Garden Water Pumps', 'Water Circulation Pump', 'Deep Well Pumps', 'Single Phase', 'CDS Series', 'Dewatering Pump']],
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const getProductImage = (category, name) => {
  return PRODUCT_IMAGES[name] || CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
};

const handleImgError = (event, category) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
};

// ============================================
// BUILD PRODUCTS DATA
// ============================================

const PRODUCTS_DATA = CATEGORY_DATA.flatMap(([category, entries], categoryIndex) =>
  entries.flatMap((entry, entryIndex) => {
    const isSeries = Array.isArray(entry);
    const subcategory = isSeries ? entry[0] : '';
    const products = isSeries ? entry[1] : [entry];
    return products.map((name, productIndex) => ({
      id: `product-${categoryIndex}-${entryIndex}-${productIndex}`,
      name,
      image: getProductImage(category, name),
      price: 'Price on request',
      badge: 'Available',
      category,
      subcategory,
      description: `${name} from our ${subcategory ? `${subcategory} - ` : ''}${category} range. Contact us for specifications and a quotation.`,
    }));
  })
);

const CATEGORIES_LIST = CATEGORY_DATA.map(([name]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name }));
const productCategory = item => item.subcategory ? `${item.category} / ${item.subcategory}` : item.category;

// ============================================
// PRODUCTS PAGE COMPONENT
// ============================================

export function ProductsPage({ go }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('');
  const filtered = PRODUCTS_DATA.filter(item =>
    `${item.name} ${item.category} ${item.subcategory}`.toLowerCase().includes(term.toLowerCase()) && (!category || item.category === category)
  );

  return <>
    <PageHead crumb="Products" title={<>Our <em>Products</em></>} desc={`Browse our complete industrial safety catalogue: ${PRODUCTS_DATA.length} products across ${CATEGORIES_LIST.length} categories.`}/>
    <section className="catalog">
      <aside className="product-categories">
        <h3>Categories</h3>
        <label className={`category-select ${category ? '' : 'selected'}`}>
          <span>Select a category</span>
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Select a product category">
            <option value="">All products</option>
            {CATEGORIES_LIST.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="category-filter-list" aria-label="Product categories">
          <button className={!category ? 'selected' : ''} onClick={() => setCategory('')}>All products</button>
          {CATEGORIES_LIST.map(item => <button className={category === item.name ? 'selected' : ''} key={item.id} onClick={() => setCategory(item.name)}>{item.name}</button>)}
        </div>
      </aside>
      <main>
        <div className="find">
          <input placeholder="Search products or series..." value={term} onChange={event => setTerm(event.target.value)}/>
          <Btn>Search</Btn>
        </div>
        <p className="product-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}{category ? ` in ${category}` : ''}</p>
        <div className="product-grid">
          {filtered.map(item => <article key={item.id} className="product-card">
            <div className="product-badge">{item.badge}</div>
            <button className="product-open" onClick={() => selectProduct(item, 'productdetail', go)}>
              <img src={item.image} alt={item.name} onError={event => handleImgError(event, item.category)} loading="lazy"/>
              <h3>{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <p className="product-category">{productCategory(item)}</p>
            </button>
            <button className="order-product" onClick={() => selectProduct(item, 'contact', go)}>Order / Quote</button>
          </article>)}
        </div>
        {!filtered.length && <p className="no-products">No products match your search.</p>}
      </main>
    </section>
  </>;
}

// ============================================
// PRODUCT DETAIL PAGE COMPONENT
// ============================================

export function ProductDetailPage({ go, content }) {
  const selected = (() => { try { return JSON.parse(localStorage.getItem('raja_selected_product')); } catch { return null; } })();
  const product = selected && PRODUCTS_DATA.find(item => item.id === selected.id) || selected;
  if (!product) return <section className="page-loading">Choose a product from our catalogue to view its details.</section>;
  const related = PRODUCTS_DATA.filter(item => item.id !== product.id && item.category === product.category).slice(0, 5);
  const whatsapp = `https://wa.me/${String(content?.site?.whatsappNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`;
  const phone = content?.site?.phone || '+91 99413 36125';

  return <>
    <div className="crumb">Home / {productCategory(product)} / {product.name}</div>
    <section className="detail">
      <div className="product-image"><span>{product.badge || 'Product'}</span><img src={product.image} alt={product.name} onError={event => handleImgError(event, product.category)}/></div>
      <div className="detail-copy">
        <small>{productCategory(product)}</small><h1>{product.name}</h1>
        <p className="product-detail-price" style={{ fontSize: '18px', color: 'var(--red)', fontWeight: '700', margin: '10px 0' }}>{product.price}</p>
        <p>{product.description}</p><Btn onClick={() => selectProduct(product, 'contact', go)}>Request this product</Btn>
      </div>
      <aside className="details-box">
        <h3>Product Details</h3><p><b>Category</b><span>{product.category}</span></p>
        {product.subcategory && <p><b>Series</b><span>{product.subcategory}</span></p>}
        <p><b>Price</b><span>{product.price}</span></p><p><b>Availability</b><span>Contact us</span></p>
        <div className="help"><b>Need help?</b><a href={`tel:${phone}`}>{phone}</a><a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp Us</a></div>
      </aside>
    </section>
    <section className="related"><h2>Related Products in {product.category}</h2>
      {related.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px' }}>
        {related.map(item => <button key={item.id} onClick={() => selectProduct(item, 'productdetail', go)} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: '1px solid var(--line)', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#fff' }}><img src={item.image} alt={item.name} onError={event => handleImgError(event, item.category)} loading="lazy" style={{ width: '100%', height: '100px', objectFit: 'cover' }}/><b style={{ fontSize: '12px' }}>{item.name}</b><span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700' }}>{item.price}</span></button>)}
      </div> : <p>No other products in this category.</p>}
    </section>
  </>;
}