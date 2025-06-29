/*
 Navicat Premium Data Transfer

 Source Server         : cloud_ada
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44-log)
 Source Host           : 101.132.195.103:3306
 Source Schema         : js_ada

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44-log)
 File Encoding         : 65001

 Date: 09/06/2025 12:17:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for exchange
-- ----------------------------
DROP TABLE IF EXISTS `exchange`;
CREATE TABLE `exchange`  (
  `ex_id` int(11) NOT NULL COMMENT '兑换编号',
  `ex_good_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '兑换商品名称',
  `ex_time` datetime NULL DEFAULT NULL COMMENT '兑换时间',
  `ex_score` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '兑换积分',
  `ex_uid` int(11) NULL DEFAULT NULL COMMENT '兑换人',
  PRIMARY KEY (`ex_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of exchange
-- ----------------------------

-- ----------------------------
-- Table structure for feedback
-- ----------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback`  (
  `fb_id` int(11) NOT NULL COMMENT '反馈编号',
  `fb_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '反馈内容',
  `fb_type` int(11) NULL DEFAULT NULL COMMENT '反馈类型',
  `fb_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '反馈者手机号',
  `fb_appendix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '反馈附件',
  PRIMARY KEY (`fb_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of feedback
-- ----------------------------

-- ----------------------------
-- Table structure for post
-- ----------------------------
DROP TABLE IF EXISTS `post`;
CREATE TABLE `post`  (
  `f_id` int(11) NOT NULL COMMENT '帖子id',
  `f_type` int(11) NOT NULL COMMENT '帖子类型',
  `f_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子标题',
  `f_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '帖子内容',
  `f_uid` int(11) NULL DEFAULT NULL COMMENT '帖子发布人',
  `f_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  PRIMARY KEY (`f_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of post
-- ----------------------------

-- ----------------------------
-- Table structure for reply
-- ----------------------------
DROP TABLE IF EXISTS `reply`;
CREATE TABLE `reply`  (
  `rp_id` int(11) NOT NULL COMMENT '回复编号',
  `rp_fid` int(11) NULL DEFAULT NULL COMMENT '帖子编号',
  `rp_uid` int(11) NULL DEFAULT NULL COMMENT '回复者用户编号',
  `rp_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '回复内容',
  `rp_time` datetime NULL DEFAULT NULL COMMENT '回复时间',
  PRIMARY KEY (`rp_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of reply
-- ----------------------------

-- ----------------------------
-- Table structure for request
-- ----------------------------
DROP TABLE IF EXISTS `request`;
CREATE TABLE `request`  (
  `r_id` int(11) NOT NULL COMMENT '需求编号',
  `r_hid` int(11) NULL DEFAULT NULL COMMENT '残障人士id',
  `r_vid` int(11) NULL DEFAULT NULL COMMENT '志愿者id',
  `r_send_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `r_score` int(11) NULL DEFAULT NULL COMMENT '积分',
  `r_type` int(11) NULL DEFAULT NULL COMMENT '需求类型',
  `r_is_solve` int(11) NULL DEFAULT NULL COMMENT '是否解决',
  `r_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '需求内容',
  `r_urgent` int(11) NULL DEFAULT NULL COMMENT '紧急程度',
  `r_rate` int(11) NULL DEFAULT NULL COMMENT '评分',
  `r_solve_time` datetime NULL DEFAULT NULL COMMENT '解决时间',
  `r_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址',
  `r_is_online` int(11) DEFAULT 1 COMMENT '求助方式：0-线下 1-线上',
  PRIMARY KEY (`r_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of request
-- ----------------------------

-- ----------------------------
-- Table structure for score_store
-- ----------------------------
DROP TABLE IF EXISTS `score_store`;
CREATE TABLE `score_store`  (
  `s_good_id` int(11) NOT NULL COMMENT '商品编号',
  `s_good_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品名称',
  `s_good_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品介绍',
  `s_good_score` int(11) NULL DEFAULT NULL COMMENT '商品所需积分',
  `s_good_stock` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品库存',
  `s_good_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品图片',
  PRIMARY KEY (`s_good_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of score_store
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `u_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户编号',
  `u_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `u_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码',
  `u_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `u_type` int(11) NULL DEFAULT NULL COMMENT '用户类型',
  `u_score` int(11) NULL DEFAULT NULL COMMENT '用户积分',
  `u_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户地址',
  `u_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '用户介绍',
  `u_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户个人标签',
  `u_real_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户真实姓名',
  `u_identity_number` char(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户身份证号码',
  PRIMARY KEY (`u_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (0, '访客', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user` VALUES (1, 'admin', 'c8837b23ff8aaa8a2dde915473ce0991', '12345', 0, 9999, '安徽省淮北市相山区', '这是我的个人介绍', NULL, '张三', '340603000000000000');

-- ----------------------------
-- 数据库结构更新语句
-- ----------------------------

-- 为request表添加r_is_online字段
ALTER TABLE `request` 
ADD COLUMN `r_is_online` int(11) DEFAULT 1 COMMENT '求助方式：0-线下 1-线上' 
AFTER `r_address`;

SET FOREIGN_KEY_CHECKS = 1;
